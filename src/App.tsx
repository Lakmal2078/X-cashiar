import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Receipt, 
  Bot, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Search,
  Sparkles,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Item {
  quantity: number;
}

const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Espresso Coffee', price: 3.50, category: 'Beverages', image: '☕' },
  { id: '2', name: 'Iced Latte', price: 4.50, category: 'Beverages', image: '🧋' },
  { id: '3', name: 'Avocado Toast', price: 8.00, category: 'Food', image: '🥑' },
  { id: '4', name: 'Croissant', price: 3.00, category: 'Bakery', image: '🥐' },
  { id: '5', name: 'Cheeseburger', price: 10.50, category: 'Food', image: '🍔' },
  { id: '6', name: 'French Fries', price: 4.00, category: 'Food', image: '🍟' },
];

export default function App() {
  const [items] = useState<Item[]>(INITIAL_ITEMS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'ai'>('pos');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  const addToCart = (item: Item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsCheckoutSuccess(false);
    }, 2500);
  };

  const askAiAssistant = async () => {
    setIsAiLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        setAiInsight("Gemini API Key is not set in environment variables. Please set GEMINI_API_KEY to test AI features.");
        setIsAiLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as an expert retail cashier and business consultant for X-Cashiar. Give a concise 3-bullet point sales optimization strategy for a small cafe offering beverages and bakery items.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setAiInsight(response.text || 'No insights generated.');
    } catch (err: any) {
      setAiInsight(`Error connecting to Gemini AI: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">X-Cashiar</h1>
            <p className="text-xs text-slate-400">Smart POS & Cashier System</p>
          </div>
        </div>

        <nav className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Register</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden flex">
        {activeTab === 'pos' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Catalog Section */}
            <section className="flex-1 p-6 overflow-y-auto border-r border-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex flex-col items-start p-4 bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl transition-all duration-200 hover:scale-[1.02] text-left group"
                  >
                    <div className="text-3xl mb-3">{item.image}</div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="font-bold text-slate-100">${item.price.toFixed(2)}</span>
                      <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Cart Section */}
            <section className="w-full md:w-96 bg-slate-900/40 p-6 flex flex-col justify-between border-t md:border-t-0 border-slate-800">
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  <span>Current Order</span>
                </h2>

                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No items in order</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-400 hover:text-red-300 ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary & Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-indigo-400">${total.toFixed(2)}</span>
                </div>

                {isCheckoutSuccess ? (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-center font-semibold flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Payment Processed!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all ${
                      cart.length > 0
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Charge ${total.toFixed(2)}</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* AI Assistant Tab */
          <div className="flex-1 p-8 max-w-3xl mx-auto overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">X-Cashiar AI Advisory</h2>
                  <p className="text-xs text-slate-400">Powered by Google Gemini 2.5</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Generate real-time business insights, optimize inventory menu items, and receive customized cashflow strategies.
              </p>

              <button
                onClick={askAiAssistant}
                disabled={isAiLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>{isAiLoading ? 'Analyzing Business Data...' : 'Generate Sales Strategy'}</span>
              </button>

              {aiInsight && (
                <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {aiInsight}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
