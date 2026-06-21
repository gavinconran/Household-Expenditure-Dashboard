import React, { useState, useMemo } from "react";
import { 
  transactionsData, 
  getRawCSVString 
} from "./data/transactions";
import { Transaction } from "./types";
import { 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  Info, 
  Layers, 
  List, 
  FileText, 
  CheckCircle, 
  Search, 
  Sparkles, 
  Filter, 
  Building2, 
  Wallet, 
  Zap, 
  Tv, 
  Home, 
  Tag, 
  Car, 
  GraduationCap, 
  Percent, 
  ShoppingBag,
  ExternalLink,
  ChevronDown
} from "lucide-react";

export default function App() {
  // Active selected month filter. "all" or specific month (e.g. "2026-01")
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  // Transaction search keyword filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Selected bank filter
  const [selectedBank, setSelectedBank] = useState<string>("all");
  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Active Tab for inspectable views: "visualization" or "rawCSV" or "parsedJSON"
  const [activeTab, setActiveTab] = useState<"visualization" | "rawCSV" | "parsedJSON">("visualization");
  // Active drilled down category for detailed view
  const [drilledCategory, setDrilledCategory] = useState<string | null>(null);

  // Distinct months present in data sorted chronologically
  const months = useMemo(() => {
    return [
      { id: "all", label: "All Months", desc: "Jan 2026 - Jun 2026" },
      { id: "2026-01", label: "January 2026", desc: "Start of year spend" },
      { id: "2026-02", label: "February 2026", desc: "Heating & groceries" },
      { id: "2026-03", label: "March 2026", desc: "Spring bills" },
      { id: "2026-04", label: "April 2026", desc: "Fuel & utilities" },
      { id: "2026-05", label: "May 2026", desc: "Education & sub bills" },
      { id: "2026-06", label: "June 2026", desc: "Summer bills" }
    ];
  }, []);

  // Filtered transactions based on State Selection
  const filteredTransactions = useMemo(() => {
    return transactionsData.filter((tx) => {
      // Month Filter
      if (selectedMonth !== "all" && !tx.date.startsWith(selectedMonth)) {
        return false;
      }
      
      // Bank Filter
      if (selectedBank !== "all" && tx.bank !== selectedBank) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== "all" && tx.category !== selectedCategory) {
        return false;
      }

      // Search keyword filter
      if (searchTerm.trim() !== "") {
        const keyword = searchTerm.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(keyword);
        const catMatch = tx.category.toLowerCase().includes(keyword);
        const bankMatch = tx.bank.toLowerCase().includes(keyword);
        const dateMatch = tx.date.includes(keyword);
        const amountMatch = Math.abs(tx.amount).toString().includes(keyword);
        return descMatch || catMatch || bankMatch || dateMatch || amountMatch;
      }

      return true;
    });
  }, [selectedMonth, selectedBank, selectedCategory, searchTerm]);

  // Aggregate stats based on active month
  const stats = useMemo(() => {
    const transactionsForMonth = transactionsData.filter(tx => 
      selectedMonth === "all" || tx.date.startsWith(selectedMonth)
    );

    const totalOutgoings = transactionsForMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalTransactionsCount = transactionsForMonth.length;
    const averageSpend = totalTransactionsCount > 0 ? totalOutgoings / totalTransactionsCount : 0;

    // Daily average based on days of active month
    let daysInMonth = 184; // approx days from Jan 1 to June 18
    if (selectedMonth === "2026-01") daysInMonth = 31;
    else if (selectedMonth === "2026-02") daysInMonth = 28;
    else if (selectedMonth === "2026-03") daysInMonth = 31;
    else if (selectedMonth === "2026-04") daysInMonth = 30;
    else if (selectedMonth === "2026-05") daysInMonth = 31;
    else if (selectedMonth === "2026-06") daysInMonth = 30; // June has 30 days

    const dailyAverage = totalOutgoings / daysInMonth;

    return {
      totalOutgoings,
      totalTransactionsCount,
      averageSpend,
      dailyAverage
    };
  }, [selectedMonth]);

  // Aggregated calculations for month-by-month grid comparison
  const monthlyComparisons = useMemo(() => {
    const monthsKeys = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
    return monthsKeys.map(mKey => {
      const txs = transactionsData.filter(tx => tx.date.startsWith(mKey));
      const total = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const count = txs.length;
      return {
        key: mKey,
        label: mKey === "2026-01" ? "January" :
               mKey === "2026-02" ? "February" :
               mKey === "2026-03" ? "March" :
               mKey === "2026-04" ? "April" :
               mKey === "2026-05" ? "May" : "June",
        totalStr: formatValue(total),
        totalVal: total,
        count
      };
    });
  }, []);

  // Aggregate Category breakdown for the active month selection
  const categoryBreakdown = useMemo(() => {
    const transactionsForMonth = transactionsData.filter(tx => 
      selectedMonth === "all" || tx.date.startsWith(selectedMonth)
    );

    const categoryMap: { [key: string]: number } = {};
    transactionsForMonth.forEach(tx => {
      const absAmount = Math.abs(tx.amount);
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + absAmount;
    });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryMap).map(([category, amount]) => {
      return {
        category,
        amount,
        formattedAmount: formatValue(amount),
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [selectedMonth]);

  // Aggregate Bank breakdown for the active month selection
  const bankBreakdown = useMemo(() => {
    const transactionsForMonth = transactionsData.filter(tx => 
      selectedMonth === "all" || tx.date.startsWith(selectedMonth)
    );

    const bankMap: { [key: string]: number } = {};
    transactionsForMonth.forEach(tx => {
      const absAmount = Math.abs(tx.amount);
      bankMap[tx.bank] = (bankMap[tx.bank] || 0) + absAmount;
    });

    const total = Object.values(bankMap).reduce((sum, val) => sum + val, 0);

    return Object.entries(bankMap).map(([bank, amount]) => {
      return {
        bank,
        amount,
        formattedAmount: formatValue(amount),
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [selectedMonth]);

  // Aggregate itemized vendor drilldown breakdown inside selected category
  const drilledCategoryBreakdown = useMemo(() => {
    if (!drilledCategory) return [];

    const categoryTxs = transactionsData.filter((tx) => {
      const matchMonth = selectedMonth === "all" || tx.date.startsWith(selectedMonth);
      const matchCategory = tx.category === drilledCategory;
      return matchMonth && matchCategory;
    });

    const vendorMap: { [key: string]: { total: number; count: number; bankBreakdown: { [bank: string]: number } } } = {};

    categoryTxs.forEach((tx) => {
      const absAmt = Math.abs(tx.amount);
      if (!vendorMap[tx.description]) {
        vendorMap[tx.description] = { total: 0, count: 0, bankBreakdown: {} };
      }
      vendorMap[tx.description].total += absAmt;
      vendorMap[tx.description].count += 1;
      vendorMap[tx.description].bankBreakdown[tx.bank] = (vendorMap[tx.description].bankBreakdown[tx.bank] || 0) + absAmt;
    });

    const categorySum = Object.values(vendorMap).reduce((sum, v) => sum + v.total, 0);

    return Object.entries(vendorMap).map(([description, data]) => {
      return {
        description,
        total: data.total,
        formattedTotal: formatValue(data.total),
        count: data.count,
        percentage: categorySum > 0 ? Math.round((data.total / categorySum) * 100) : 0,
        bankBreakdown: Object.entries(data.bankBreakdown).map(([bankName, bankAmt]) => ({
          bankName,
          amount: bankAmt,
          formattedAmount: formatValue(bankAmt)
        })).sort((a, b) => b.amount - a.amount)
      };
    }).sort((a, b) => b.total - a.total);
  }, [drilledCategory, selectedMonth]);

  // Utility to format values smoothly as GBP currency
  function formatValue(value: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // Get Lucide icon component mapping for categories
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Groceries": return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case "Entertainment": return <Tv className="w-4 h-4 text-indigo-600" />;
      case "Rates": return <Home className="w-4 h-4 text-orange-600" />;
      case "Utilities": return <ZapIcon className="w-4 h-4 text-amber-500" />;
      case "Transport": return <FerryIcon className="w-4/12 text-slate-500" />;
      case "Shopping": return <CompassIcon className="w-4 h-4 text-pink-600" />;
      case "Education": return <GraduationCap className="w-4 h-4 text-rose-600" />;
      case "Fees": return <Percent className="w-4 h-4 text-slate-600" />;
      default: return <Layers className="w-4 h-4 text-blue-600" />;
    }
  };

  // Get specific visual badge styling class for categorizations
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Groceries": return "bg-emerald-50 text-emerald-800 border-emerald-200/50";
      case "Entertainment": return "bg-indigo-50 text-indigo-800 border-indigo-200/50";
      case "Rates": return "bg-orange-50 text-orange-800 border-orange-200/50";
      case "Utilities": return "bg-amber-50 text-amber-800 border-amber-200/50";
      case "Transport": return "bg-sky-50 text-sky-800 border-sky-200/50";
      case "Shopping": return "bg-pink-50 text-pink-800 border-pink-200/50";
      case "Education": return "bg-rose-50 text-rose-800 border-rose-200/50";
      case "Fees": return "bg-slate-50 text-slate-800 border-slate-200/50";
      default: return "bg-blue-50 text-blue-800 border-blue-200/50";
    }
  };

  // Get specific visual icon style for bank accounts
  const getBankIcon = (bankName: string) => {
    switch (bankName) {
      case "Revolut":
        return <Wallet className="w-4 h-4 text-blue-600" />;
      case "Post Office MasterCard":
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case "Bank of Ireland UK":
        return <Building2 className="w-4 h-4 text-cyan-700" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  // Get bank color badge
  const getBankBadgeStyle = (bankName: string) => {
    switch (bankName) {
      case "Revolut":
        return "bg-blue-50/70 text-blue-700 border-blue-100";
      case "Post Office MasterCard":
        return "bg-rose-50/70 text-rose-700 border-rose-100";
      case "Bank of Ireland UK":
        return "bg-cyan-50/70 text-cyan-700 border-cyan-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 font-sans text-slate-800 antialiased" id="dashboard-root">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200/80 bg-white" id="main-header">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="header-title">
              Household Expenditure Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-tab-viz"
              onClick={() => setActiveTab("visualization")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                activeTab === "visualization"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Live Dashboard
            </button>
            <button
              id="btn-tab-csv"
              onClick={() => setActiveTab("rawCSV")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                activeTab === "rawCSV"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Raw CSV
            </button>

          </div>
        </div>
      </header>

      {/* RAW CSV TAB VIEW */}
      {activeTab === "rawCSV" && (
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8" id="raw-csv-panel">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">transactions.csv</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Physical location: /src/transactions.csv</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{transactionsData.length} records populated</span>
            </div>
            <div className="mt-4">
              <pre className="overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm font-mono text-emerald-400 max-h-[500px]">
                {getRawCSVString()}
              </pre>
            </div>
          </div>
        </main>
      )}

      {/* PARSED JSON TAB VIEW */}
      {activeTab === "parsedJSON" && (
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8" id="parsed-json-panel">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Step 2: Structured Data Representation</h2>
                <p className="text-sm text-slate-500 mt-0.5">Representing the first 5 parsed records matching raw database ingestion rules.</p>
              </div>
              <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-mono font-medium text-sky-800">
                JSON Object
              </span>
            </div>
            <div className="mt-4">
              <pre className="overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm font-mono text-sky-300">
                {JSON.stringify(transactionsData.slice(0, 5), null, 2)}
              </pre>
            </div>
          </div>
        </main>
      )}

      {/* LIVE INTERACTIVE DASHBOARD VIEW */}
      {activeTab === "visualization" && (
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8" id="visual-dashboard">
          
          {/* STATS HIGHLIGHTS BANNER (TOTAL OUTGOINGS WITH MONTH_SELECTOR) */}
          <div className="grid gap-6 lg:grid-cols-3" id="top-banner-metrics">
            
            {/* TOTAL OUTGOINGS VIEW CARD */}
            <div className="lg:col-span-2 rounded-2xl border border-indigo-100 bg-linear-to-b from-indigo-950 to-slate-950 p-6 shadow-xs text-white flex flex-col justify-between min-h-[220px]" id="total-outgoings-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-medium text-indigo-200/80">TOTAL OUTGOINGS</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-indigo-100 backdrop-blur-2xl">
                    {selectedMonth === "all" ? "All History Overall" : months.find(m => m.id === selectedMonth)?.label}
                  </span>
                </div>
                
                <div className="mt-4">
                  <span className="text-xs uppercase tracking-wider font-mono text-indigo-300/80 block">Debit Total</span>
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white block mt-1" id="outgoings-count">
                    {formatValue(stats.totalOutgoings)}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-5xs uppercase tracking-wider font-mono text-indigo-300/60 block">Transactions</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {stats.totalTransactionsCount} items
                  </span>
                </div>
                <div>
                  <span className="text-5xs uppercase tracking-wider font-mono text-indigo-300/60 block">Daily Average</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {formatValue(stats.dailyAverage)}
                  </span>
                </div>
                <div>
                  <span className="text-5xs uppercase tracking-wider font-mono text-indigo-300/60 block">Avg / Transaction</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {formatValue(stats.averageSpend)}
                  </span>
                </div>
              </div>
            </div>

            {/* MONTHLY CALENDAR RANGE / CHOOSE ACCOUNT PRESET */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex flex-col justify-between" id="account-filter-card">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Select Statement Period</h3>
              </div>

              {/* DROPDOWN SELECTOR */}
              <div className="relative mt-2">
                <label htmlFor="month-select" className="sr-only">Choose Monthly Statement</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200/80 text-gray-700 py-3 pl-3.5 pr-10 rounded-lg text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                >
                  {months.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.desc})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="mt-4 flex items-center gap-1.5 p-3 rounded-lg bg-indigo-50/40 border border-indigo-100/50">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[11px] text-indigo-800 leading-tight">
                  Showing <strong>{filteredTransactions.length} of {transactionsData.length}</strong> expenditure rows.
                </span>
              </div>
            </div>
          </div>

          {/* QUICK MONTH SELECTION PILLS DECK */}
          <div className="mt-6 bg-white overflow-hidden rounded-xl border border-slate-200/70 p-4 shadow-3xs" id="quick-month-deck">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Statement Account Timeline Selection
              </span>
              <span className="text-2xs text-indigo-600 hover:underline cursor-pointer" onClick={() => setSelectedMonth("all")}>
                Reset to All-Time
              </span>
            </div>
            <div className="flex overflow-x-auto gap-2 scrollbar-none pb-1">
              {months.map((m) => {
                const isActive = selectedMonth === m.id;
                // Calculate total spend for that month to display on badge
                const monthTotal = transactionsData
                  .filter(tx => m.id === "all" || tx.date.startsWith(m.id))
                  .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

                return (
                  <button
                    key={m.id}
                    id={`pill-month-${m.id}`}
                    onClick={() => setSelectedMonth(m.id)}
                    className={`flex-none rounded-lg px-4 py-2.5 text-left border transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                        : "bg-slate-50/50 hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="block text-xs font-semibold leading-none">{m.label}</span>
                    <span className={`block text-[11px] font-mono mt-1 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                      {formatValue(monthTotal)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>



          {/* ANALYTICS: CATEGORY BREAKDOWN & BANKS GRID */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2" id="breakdown-grid-visualizer">
            
            {/* CATEGORIES PROGRESS RATIO */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-3xs" id="category-breakdown-card">
              {drilledCategory ? (
                /* DRILL DOWN VIEW ACTIVE */
                <div id="drilldown-category-view">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-back-to-categories"
                        onClick={() => setDrilledCategory(null)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all outline-hidden cursor-pointer"
                        title="Back to overall category list"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        Back
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex rounded-md p-0.5 items-center justify-center border ${getCategoryBadgeClass(drilledCategory)}`}>
                            {getCategoryIcon(drilledCategory)}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{drilledCategory} itemization</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Itemized billing breakdown for current filters</p>
                      </div>
                    </div>
                    <span className="text-2xs font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-100">
                      Inside Selected Period
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {drilledCategoryBreakdown.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No transactions found for {drilledCategory}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Try selecting a different filter period or reset the month.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-2xs font-semibold text-indigo-800 uppercase tracking-widest font-mono">Category Share Total:</span>
                          <span className="text-sm font-extrabold text-indigo-950 font-mono">
                            {formatValue(drilledCategoryBreakdown.reduce((sum, item) => sum + item.total, 0))}
                          </span>
                        </div>

                        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                          {drilledCategoryBreakdown.map((row) => (
                            <div key={row.description} className="p-3 border border-slate-100 rounded-xl bg-slate-50/20 hover:bg-slate-50/55 transition-all">
                              <div className="flex items-start justify-between text-xs gap-2">
                                <div>
                                  <strong className="font-semibold text-slate-800 text-sm block leading-tight">{row.description}</strong>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {row.count} {row.count === 1 ? "bill" : "bills"}
                                    </span>
                                    {row.bankBreakdown.map((b) => (
                                      <span key={b.bankName} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono border ${getBankBadgeStyle(b.bankName)}`}>
                                        {getBankIcon(b.bankName)}
                                        {b.bankName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block font-bold text-slate-900 text-sm font-mono">{row.formattedTotal}</span>
                                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{row.percentage}% of sector</span>
                                </div>
                              </div>
                              
                              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                <div 
                                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${row.percentage}%` }}
                               />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* OVERVIEW CATEGORY LIST VIEW */
                <div id="overall-category-view">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-md font-bold text-slate-900">Categorical Expenditure Chart</h3>
                      <p className="text-xs text-slate-500">Spend weight sorted from highest to lowest</p>
                    </div>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {categoryBreakdown.length} active sectors
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {categoryBreakdown.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No transactions in this filter</div>
                    ) : (
                      <div className="space-y-3">
                        {categoryBreakdown.map((row) => (
                          <div 
                            key={row.category} 
                            role="button"
                            onClick={() => setDrilledCategory(row.category)}
                            className="group space-y-1.5 hover:bg-slate-50/80 p-2.5 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer block active:scale-[0.99] select-none"
                            title={`Click to analyze itemized spend in ${row.category}`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex rounded-md p-1 items-center justify-center border ${getCategoryBadgeClass(row.category)}`}>
                                  {getCategoryIcon(row.category)}
                                </span>
                                <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{row.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="space-x-1 font-mono text-slate-500">
                                  <strong className="text-slate-900 font-bold group-hover:text-indigo-950">{row.formattedAmount}</strong>
                                  <span>({row.percentage}%)</span>
                                </span>
                                <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                  drill down &rarr;
                                </span>
                              </div>
                            </div>
                            
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 group-hover:bg-indigo-500"
                                style={{ width: `${row.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                </div>
              )}
            </div>

            {/* STATEMENT INGESTION BY BANK ACCOUNT ORIGIN */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-3xs" id="bank-breakdown-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-900">Distribution by Ingestion Bank</h3>
                  <p className="text-xs text-slate-500">Expenditure traced to the source credit/debit provider</p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                  3 sources
                </span>
              </div>

              <div className="mt-5 space-y-5">
                {bankBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No transactions in this filter</div>
                ) : (
                  bankBreakdown.map((row) => (
                    <div key={row.bank} className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getBankBadgeStyle(row.bank)}`}>
                          {getBankIcon(row.bank)}
                        </div>
                        <div>
                          <strong className="block text-xs font-semibold text-slate-700">{row.bank}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{row.percentage}% total slice</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-slate-900">{row.formattedAmount}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">GBP val</span>
                      </div>
                    </div>
                  ))
                )}
              </div>


            </div>
          </div>

          {/* DETAILED LEDGER TRANSACTION LIST PANEL */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-3xs overflow-hidden" id="ledger-section">
            
            {/* SEARCH AND FILTERS CONTROLS */}
            <div className="border-b border-slate-100 bg-slate-50/40 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <List className="w-4 h-4 text-indigo-500" />
                    Ingested Ledger Transactions ({filteredTransactions.length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Bank quick list filter */}
                  <select
                    id="bank-quick-filter"
                    value={selectedBank}
                    aria-label="Filter by bank"
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="bg-white border border-slate-200 text-xs text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">All Banks</option>
                    <option value="Revolut">Revolut</option>
                    <option value="Bank of Ireland UK">Bank of Ireland UK</option>
                    <option value="Post Office MasterCard">Post Office MasterCard</option>
                  </select>

                  {/* Category quick filter */}
                  <select
                    id="category-quick-filter"
                    value={selectedCategory}
                    aria-label="Filter by category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white border border-slate-200 text-xs text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Rates">Rates</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Education">Education</option>
                    <option value="Fees">Fees</option>
                  </select>

                  {/* Reset all filters */}
                  {(selectedBank !== "all" || selectedCategory !== "all" || searchTerm !== "" || selectedMonth !== "all") && (
                    <button
                      id="btn-reset-filters"
                      onClick={() => {
                        setSelectedBank("all");
                        setSelectedCategory("all");
                        setSearchTerm("");
                        setSelectedMonth("all");
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* SEARCH BOX FOR EASY MATCHING */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query by vendor name (e.g. 'Tesco', 'Amazon'), bank, category list or absolute amount value..."
                  className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-lg text-xs leading-none focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* TRANSACTIONS TABLE VIEW */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="ledger-table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20 text-slate-400 font-mono text-2xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Origin Ingestion</th>
                    <th className="p-4 font-semibold">Date Settled</th>
                    <th className="p-4 font-semibold">Debited Vendor</th>
                    <th className="p-4 font-semibold">Category Classification</th>
                    <th className="p-4 font-semibold text-right">Amount Outflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No transactions match search criteria or selected month.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <tr 
                        key={idx} 
                        id={`tx-row-${idx}`}
                        className="hover:bg-slate-50/50 transition-all cursor-default"
                      >
                        {/* BANK BADGE */}
                        <td className="p-4 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {getBankIcon(tx.bank)}
                            <span className="text-2xs font-semibold text-slate-600">{tx.bank}</span>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="p-4 text-slate-500 font-mono text-2xs">
                          {tx.date}
                        </td>

                        {/* DESCRIPTION DESCRIPTION */}
                        <td className="p-4 font-semibold text-slate-900">
                          {tx.description}
                        </td>

                        {/* CATEGORY CLASSIFICATION */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-3xs font-semibold border ${getCategoryBadgeClass(tx.category)}`}>
                            {getCategoryIcon(tx.category)}
                            {tx.category}
                          </span>
                        </td>

                        {/* OUTGOING SUM */}
                        <td className="p-4 text-right font-bold font-mono text-slate-950">
                          {formatValue(Math.abs(tx.amount))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* LEDGER SUM TOTAL STATUS */}
            <div className="bg-slate-50/40 border-t border-slate-100 p-4 flex items-center justify-between text-2xs text-slate-500 font-mono">
              <span>LEDGER SUM</span>
              <span className="font-bold text-slate-900">
                Processed total: {formatValue(filteredTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0))} for these filtered lines
              </span>
            </div>
          </section>

        </main>
      )}

      {/* FOOTER BAR */}
      <footer className="mx-auto max-w-7xl px-4 mt-8 pb-10 text-center text-3xs text-slate-400 md:flex md:items-center md:justify-between lg:px-8 border-t border-slate-200/40 pt-4" id="view-footer">
      </footer>
    </div>
  );
}

// Minimal static fallback sub-components to ensure absolutely compile stability:
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2 L3 14 h9 l-1 8 10-12 h-9 l1-8z" />
    </svg>
  );
}

function FerryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 22 h20" />
      <path d="M17 14 H7" />
      <path d="M18 10 c0-1-1-2-2-2 H8 c-1 0-2 1-2 2" />
      <path d="M14 6h-4V3h4v3z" />
    </svg>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
