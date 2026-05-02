import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const server = express();
  const PORT = 3000;

  server.use(cors());
  server.use(express.json());

  // API Routes
  
  // POST /api/invoice
  server.post("/api/invoices", async (req, res) => {
    try {
      const { customerName, customerPhone, items, total } = req.body;

      // 1. Get/Increment Invoice Number
      const configRef = doc(db, "config", "invoices");
      const configSnap = await getDoc(configRef);
      let nextNumber = 1;
      
      if (configSnap.exists()) {
        nextNumber = configSnap.data().lastInvoiceNumber + 1;
      }
      
      await setDoc(configRef, { lastInvoiceNumber: nextNumber }, { merge: true });
      
      const invoiceNumber = `#${String(nextNumber).padStart(3, '0')}`;

      // 2. Create Invoice
      const invoiceData = {
        invoiceNumber,
        customerName: customerName || "Walking Customer",
        customerPhone,
        items,
        total,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "invoices"), invoiceData);

      // 3. Update Customer History
      const customerRef = doc(db, "customers", customerPhone);
      await setDoc(customerRef, {
        phone: customerPhone,
        name: customerName || "Walking Customer",
        lastInvoiceId: docRef.id,
        updatedAt: serverTimestamp()
      }, { merge: true });

      res.status(201).json({ id: docRef.id, ...invoiceData, createdAt: new Date() });
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // GET /api/invoices
  server.get("/api/invoices", async (req, res) => {
    try {
      const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const invoices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // GET /api/customers
  server.get("/api/customers", async (req, res) => {
    try {
      const q = query(collection(db, "customers"), orderBy("updatedAt", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      const customers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
    server.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
