const API_BASE = "/api";

export async function createInvoice(data: any) {
  const response = await fetch(`${API_BASE}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create invoice");
  return response.json();
}

export async function getInvoices() {
  const response = await fetch(`${API_BASE}/invoices`);
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
}

export async function getCustomers() {
  const response = await fetch(`${API_BASE}/customers`);
  if (!response.ok) throw new Error("Failed to fetch customers");
  return response.json();
}
