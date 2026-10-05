import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Order {
  id: number;
  customerName: string;
  contactNumber: string;
  product: string;
  quantity: number;
  customization: string;
  deliveryDate: string;
  deliveryAddress: string;
  total: number;
  status: 'CONFIRMED' | 'BAKING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  isEggless?: boolean;
  deliverySlot?: string;
  createdAt: string;
}

const PRODUCT_PRICES: Record<string, number> = {
  'Birthday Cake': 850,
  'Chocolate Cake': 950,
  'Cupcake': 120,
  'Cookies': 250,
  'Red Velvet Cake': 890,
  'Blueberry Cheesecake': 1100,
};

let currentOrderId = 1005;

let orders: Order[] = [
  {
    id: 1001,
    customerName: 'Ananya Sharma',
    contactNumber: '+91 98765 43210',
    product: 'Birthday Cake',
    quantity: 1,
    customization: 'Vanilla sponge with fresh strawberries, write "Happy 7th Birthday Aarav!" in cursive chocolate lettering.',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryAddress: 'Flat 402, Rosewood Heights, Indiranagar, Bengaluru',
    total: 850,
    status: 'BAKING',
    isEggless: true,
    deliverySlot: '4:00 PM - 6:00 PM',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 1002,
    customerName: 'Vikram Mehta',
    contactNumber: '+91 98112 34567',
    product: 'Chocolate Cake',
    quantity: 1,
    customization: 'Dutch dark chocolate truffle with gold leaf accents and edible pearls. Extra ganache.',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'Villa 18, Palm Meadows, Whitefield, Bengaluru',
    total: 950,
    status: 'READY',
    isEggless: false,
    deliverySlot: '2:00 PM - 4:00 PM',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 1003,
    customerName: 'Priya Patel',
    contactNumber: '+91 99201 88450',
    product: 'Cupcake',
    quantity: 6,
    customization: 'Assorted box: 2 Salted Caramel, 2 Belgian Choc, 2 Red Velvet with cream cheese swirl.',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'B-201, Green Acres, Koramangala 4th Block, Bengaluru',
    total: 720,
    status: 'OUT_FOR_DELIVERY',
    isEggless: true,
    deliverySlot: '11:00 AM - 1:00 PM',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 1004,
    customerName: 'Rahul Verma',
    contactNumber: '+91 97654 32198',
    product: 'Cookies',
    quantity: 2,
    customization: 'Choco-chip & oatmeal raisin freshly baked cookie jar with celebration ribbon.',
    deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    deliveryAddress: 'Tower 3, Apt 1104, Prestige Lakeside, Varthur, Bengaluru',
    total: 500,
    status: 'DELIVERED',
    isEggless: true,
    deliverySlot: '10:00 AM - 12:00 PM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // CORS headers just in case of different origins or dev requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // GET all orders
  app.get('/api/orders', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let filtered = [...orders];

    if (status && typeof status === 'string' && status !== 'ALL') {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toString().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.contactNumber.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      );
    }

    // Sort descending by id (latest first)
    filtered.sort((a, b) => b.id - a.id);
    res.json(filtered);
  });

  // GET single order by id
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const order = orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ message: `Order #${id} not found` });
      return;
    }
    res.json(order);
  });

  // POST create new order
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      customerName,
      contactNumber,
      product = 'Birthday Cake',
      quantity = 1,
      customization = '',
      deliveryDate,
      deliveryAddress,
      isEggless = false,
      deliverySlot = 'Flexible (10 AM - 7 PM)',
    } = req.body;

    if (!customerName || !contactNumber || !deliveryDate || !deliveryAddress) {
      res.status(400).json({ message: 'Customer name, contact number, delivery date, and address are required' });
      return;
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const basePrice = PRODUCT_PRICES[product] || 500;
    const egglessCharge = isEggless ? 50 * qty : 0;
    const total = basePrice * qty + egglessCharge;

    const newOrder: Order = {
      id: currentOrderId++,
      customerName: customerName.trim(),
      contactNumber: contactNumber.trim(),
      product,
      quantity: qty,
      customization: customization.trim(),
      deliveryDate,
      deliveryAddress: deliveryAddress.trim(),
      total,
      status: 'CONFIRMED',
      isEggless: Boolean(isEggless),
      deliverySlot,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  // PUT /api/orders/:id/status?status=STATUS or req.body.status
  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const statusParam = (req.query.status as string) || req.body?.status;

    if (!statusParam) {
      res.status(400).json({ message: 'Status parameter is required' });
      return;
    }

    const validStatuses = ['CONFIRMED', 'BAKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const normalizedStatus = statusParam.toUpperCase() as Order['status'];

    if (!validStatuses.includes(normalizedStatus)) {
      res.status(400).json({ message: `Invalid status: ${statusParam}` });
      return;
    }

    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      res.status(404).json({ message: `Order #${id} not found` });
      return;
    }

    orders[orderIndex].status = normalizedStatus;
    res.json(orders[orderIndex]);
  });

  // PATCH /api/orders/:id/status
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const order = orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ message: `Order #${id} not found` });
      return;
    }

    order.status = status;
    res.json(order);
  });

  // DELETE /api/orders/:id
  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const initialLength = orders.length;
    orders = orders.filter((o) => o.id !== id);

    if (orders.length === initialLength) {
      res.status(404).json({ message: `Order #${id} not found` });
      return;
    }

    res.json({ message: `Order #${id} deleted successfully` });
  });

  // POST /api/orders/reset (restore sample data)
  app.post('/api/orders/reset', (req: Request, res: Response) => {
    orders = [
      {
        id: 1001,
        customerName: 'Ananya Sharma',
        contactNumber: '+91 98765 43210',
        product: 'Birthday Cake',
        quantity: 1,
        customization: 'Vanilla sponge with fresh strawberries, write "Happy 7th Birthday Aarav!" in cursive chocolate lettering.',
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        deliveryAddress: 'Flat 402, Rosewood Heights, Indiranagar, Bengaluru',
        total: 850,
        status: 'BAKING',
        isEggless: true,
        deliverySlot: '4:00 PM - 6:00 PM',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 1002,
        customerName: 'Vikram Mehta',
        contactNumber: '+91 98112 34567',
        product: 'Chocolate Cake',
        quantity: 1,
        customization: 'Dutch dark chocolate truffle with gold leaf accents and edible pearls. Extra ganache.',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryAddress: 'Villa 18, Palm Meadows, Whitefield, Bengaluru',
        total: 950,
        status: 'READY',
        isEggless: false,
        deliverySlot: '2:00 PM - 4:00 PM',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 1003,
        customerName: 'Priya Patel',
        contactNumber: '+91 99201 88450',
        product: 'Cupcake',
        quantity: 6,
        customization: 'Assorted box: 2 Salted Caramel, 2 Belgian Choc, 2 Red Velvet with cream cheese swirl.',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryAddress: 'B-201, Green Acres, Koramangala 4th Block, Bengaluru',
        total: 720,
        status: 'OUT_FOR_DELIVERY',
        isEggless: true,
        deliverySlot: '11:00 AM - 1:00 PM',
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      },
      {
        id: 1004,
        customerName: 'Rahul Verma',
        contactNumber: '+91 97654 32198',
        product: 'Cookies',
        quantity: 2,
        customization: 'Choco-chip & oatmeal raisin freshly baked cookie jar with celebration ribbon.',
        deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        deliveryAddress: 'Tower 3, Apt 1104, Prestige Lakeside, Varthur, Bengaluru',
        total: 500,
        status: 'DELIVERED',
        isEggless: true,
        deliverySlot: '10:00 AM - 12:00 PM',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    res.json({ message: 'Orders reset to default samples', orders });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍰 Sweet Home Bakery server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
