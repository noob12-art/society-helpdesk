const firebaseConfig = {
  apiKey: "AIzaSyD-7BcS-OWkKKtlffxFbxLz9mKwqOzcgOg",
  authDomain: "society-helpdesk-9b874.firebaseapp.com",
  projectId: "society-helpdesk-9b874",
  storageBucket: "society-helpdesk-9b874.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:210358422355:web:a452b84974ff9ba341efa6",
};

const STORAGE_KEYS = {
  users: "society-helpdesk-users",
  complaints: "society-helpdesk-complaints",
  currentUser: "society-helpdesk-current-user",
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => value && !String(value).startsWith("YOUR_")
);

function readStorage(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedLocalData() {
  const users = readStorage(STORAGE_KEYS.users);

  if (!users.some((user) => user.email === "admin@societyhelpdesk.com")) {
    users.push({
      id: crypto.randomUUID(),
      fullName: "Society Admin",
      flatNumber: "Office",
      phoneNumber: "9999999999",
      email: "admin@societyhelpdesk.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    writeStorage(STORAGE_KEYS.users, users);
  }

  if (!localStorage.getItem(STORAGE_KEYS.complaints)) {
    writeStorage(STORAGE_KEYS.complaints, []);
  }
}

seedLocalData();

let firebaseServicesPromise;

async function getFirebaseServices() {
  if (!hasFirebaseConfig) return null;
  if (firebaseServicesPromise) return firebaseServicesPromise;

  firebaseServicesPromise = (async () => {
    const [{ initializeApp }, authSdk, firestoreSdk] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    ]);

    const app = initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    const db = firestoreSdk.getFirestore(app);

    return { auth, db, authSdk, firestoreSdk };
  })();

  return firebaseServicesPromise;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || "null");
}

export async function logoutCurrentUser() {
  const services = await getFirebaseServices();
  if (services?.auth?.currentUser) {
    await services.authSdk.signOut(services.auth);
  }

  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export async function registerResident(userData) {
  const services = await getFirebaseServices();

  if (services) {
    const { auth, db, authSdk, firestoreSdk } = services;
    const credential = await authSdk.createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    await authSdk.updateProfile(credential.user, {
      displayName: userData.fullName,
    });

    const profile = {
      uid: credential.user.uid,
      id: credential.user.uid,
      fullName: userData.fullName,
      flatNumber: userData.flatNumber,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      role: "resident",
      createdAt: new Date().toISOString(),
    };

    await firestoreSdk.setDoc(firestoreSdk.doc(db, "users", credential.user.uid), profile);
    setCurrentUser(profile);
    return profile;
  }

  const users = readStorage(STORAGE_KEYS.users);
  const existing = users.find((user) => user.email.toLowerCase() === userData.email.toLowerCase());

  if (existing) {
    throw new Error("This email is already registered.");
  }

  const newUser = {
    id: crypto.randomUUID(),
    fullName: userData.fullName,
    flatNumber: userData.flatNumber,
    phoneNumber: userData.phoneNumber,
    email: userData.email,
    password: userData.password,
    role: "resident",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeStorage(STORAGE_KEYS.users, users);
  const safeUser = sanitizeUser(newUser);
  setCurrentUser(safeUser);
  return safeUser;
}

export async function loginUser({ email, password, role }) {
  const services = await getFirebaseServices();

  if (services) {
    const { auth, db, authSdk, firestoreSdk } = services;
    const credential = await authSdk.signInWithEmailAndPassword(auth, email, password);
    const docRef = firestoreSdk.doc(db, "users", credential.user.uid);
    const userDoc = await firestoreSdk.getDoc(docRef);
    const profile = userDoc.exists()
      ? userDoc.data()
      : {
          uid: credential.user.uid,
          id: credential.user.uid,
          fullName: credential.user.displayName || "User",
          email: credential.user.email,
          role: email.toLowerCase().includes("admin") ? "admin" : "resident",
        };

    if (role === "admin" && profile.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }

    setCurrentUser(profile);
    return profile;
  }

  const users = readStorage(STORAGE_KEYS.users);
  const matchedUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!matchedUser) {
    throw new Error("Invalid email or password.");
  }

  if (role === "admin" && matchedUser.role !== "admin") {
    throw new Error("Please use an admin account for admin access.");
  }

  const safeUser = sanitizeUser(matchedUser);
  setCurrentUser(safeUser);
  return safeUser;
}

function generateComplaintId() {
  return `CMP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function createComplaint(complaintData) {
  const currentUser = getCurrentUser();
  const payload = {
    id: crypto.randomUUID(),
    complaintId: generateComplaintId(),
    name: complaintData.name,
    email: complaintData.email,
    flatNumber: complaintData.flatNumber,
    category: complaintData.category,
    priority: complaintData.priority,
    location: complaintData.location,
    title: complaintData.title,
    description: complaintData.description,
    status: "Received",
    remarks: "Complaint submitted successfully.",
    createdBy: currentUser?.id || null,
    createdAt: new Date().toISOString(),
  };

  const services = await getFirebaseServices();
  if (services) {
    const { db, firestoreSdk } = services;
    await firestoreSdk.setDoc(firestoreSdk.doc(db, "complaints", payload.id), payload);
    return payload;
  }

  const complaints = readStorage(STORAGE_KEYS.complaints);
  complaints.unshift(payload);
  writeStorage(STORAGE_KEYS.complaints, complaints);
  return payload;
}

export async function getAllComplaints() {
  const services = await getFirebaseServices();
  if (services) {
    const { db, firestoreSdk } = services;
    const snapshot = await firestoreSdk.getDocs(firestoreSdk.collection(db, "complaints"));
    return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return readStorage(STORAGE_KEYS.complaints);
}

export async function getComplaintsForCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  const complaints = await getAllComplaints();

  if (currentUser.role === "admin") {
    return complaints;
  }

  return complaints.filter((complaint) => complaint.email === currentUser.email);
}

export async function updateComplaint(id, updates) {
  const services = await getFirebaseServices();
  const nextUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (services) {
    const { db, firestoreSdk } = services;
    await firestoreSdk.updateDoc(firestoreSdk.doc(db, "complaints", id), nextUpdates);
    return;
  }

  const complaints = readStorage(STORAGE_KEYS.complaints).map((complaint) =>
    complaint.id === id ? { ...complaint, ...nextUpdates } : complaint
  );

  writeStorage(STORAGE_KEYS.complaints, complaints);
}