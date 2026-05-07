const admin = require("firebase-admin");

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : fallback;
}

function requireValue(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}. Pass --${name}=value.`);
  }

  return value;
}

const serviceAccountPath =
  readArg("key", process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccount = require(requireValue("key", serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function main() {
  await admin.firestore().collection("orders").doc("ADM-002").set(
    {
      id: "ADM-002",
      customer: "Marcus Hill",
      restaurantId: "featured-1",
      restaurant: "NY Pizza Place",
      total: "$31.75",
      status: "ready",
      adminStatus: "Ready for Driver",
      placedAt: "2:06 PM",
      eta: "8 min",
      driver: "Unassigned",
      driverId: null,
      driverName: null,
      issue: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log("ADM-002 is ready and unassigned.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete();
  });
