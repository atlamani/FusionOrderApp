const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : fallback;
}

function requireValue(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}. Pass --${name}=value or set ${name.toUpperCase().replace(/-/g, "_")}.`);
  }

  return value;
}

function resolveLocalPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function readJsonFile(filePath) {
  const resolvedPath = resolveLocalPath(filePath);
  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

const serviceAccountPath =
  readArg("key", process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const configPath = readArg("config", process.env.STAFF_CLAIMS_CONFIG);
const managerEmail = readArg("manager-email", process.env.MANAGER_EMAIL);
const restaurantEmail = readArg("restaurant-email", process.env.RESTAURANT_EMAIL);
const restaurantId = readArg("restaurant-id", process.env.RESTAURANT_ID);
const driverEmail = readArg("driver-email", process.env.DRIVER_EMAIL);
const driverId = readArg("driver-id", process.env.DRIVER_ID);

const serviceAccount = require(resolveLocalPath(requireValue("key", serviceAccountPath)));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function normalizeEmail(email) {
  return requireValue("email", email).trim().toLowerCase();
}

function normalizeClaims(entry) {
  if (entry.claims && typeof entry.claims === "object") {
    if (entry.claims.admin === true) {
      return { admin: true };
    }

    if (typeof entry.claims.restaurantId === "string" && entry.claims.restaurantId.trim()) {
      return { restaurantId: entry.claims.restaurantId.trim() };
    }

    if (typeof entry.claims.driverId === "string" && entry.claims.driverId.trim()) {
      return { driverId: entry.claims.driverId.trim() };
    }
  }

  if (entry.role === "manager" || entry.role === "admin") {
    return { admin: true };
  }

  if (entry.role === "restaurant") {
    return { restaurantId: requireValue("restaurant-id", entry.restaurantId).trim() };
  }

  if (entry.role === "driver") {
    return { driverId: requireValue("driver-id", entry.driverId).trim() };
  }

  throw new Error(`No valid staff claim found for ${entry.email || "an entry"}.`);
}

function readConfigAssignments() {
  if (!configPath) {
    return [];
  }

  const config = readJsonFile(configPath);
  if (!Array.isArray(config.users)) {
    throw new Error("Staff claims config must include a users array.");
  }

  return config.users
    .filter((entry) => entry && entry.disabled !== true)
    .map((entry) => ({
      email: normalizeEmail(entry.email),
      claims: normalizeClaims(entry),
    }));
}

function readArgumentAssignments() {
  const assignments = [];

  if (managerEmail) {
    assignments.push({ email: normalizeEmail(managerEmail), claims: { admin: true } });
  }

  if (restaurantEmail) {
    assignments.push({
      email: normalizeEmail(restaurantEmail),
      claims: { restaurantId: requireValue("restaurant-id", restaurantId).trim() },
    });
  }

  if (driverEmail) {
    assignments.push({
      email: normalizeEmail(driverEmail),
      claims: { driverId: requireValue("driver-id", driverId).trim() },
    });
  }

  return assignments;
}

async function setClaims(email, claims) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log(`Updated ${email}: ${JSON.stringify(claims)}`);
}

async function main() {
  const assignments = [...readConfigAssignments(), ...readArgumentAssignments()];

  if (assignments.length === 0) {
    throw new Error(
      "No staff accounts provided. Pass --config=tools/staff-claims.example.json or role-specific email flags.",
    );
  }

  const failed = [];

  for (const assignment of assignments) {
    try {
      await setClaims(assignment.email, assignment.claims);
    } catch (error) {
      failed.push({ email: assignment.email, message: error.message });
      console.error(`Failed ${assignment.email}: ${error.message}`);
    }
  }

  if (failed.length > 0) {
    throw new Error(
      `Updated ${assignments.length - failed.length} account(s), but ${failed.length} account(s) failed.`,
    );
  }

  console.log("Staff claims updated. Sign out and back in before testing.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete();
  });
