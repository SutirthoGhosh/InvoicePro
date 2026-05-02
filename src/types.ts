export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  total: number;
  createdAt: any;
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  lastInvoiceId?: string;
  updatedAt: any;
}
