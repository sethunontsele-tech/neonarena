import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, LineChart, Move3d, RotateCcw, HelpCircle, 
  X, Check, AlertCircle, Copy, BookOpen, Sparkles, TrendingUp
} from 'lucide-react';

// ==========================================
// Safe Recursive Descent Mathematical Parser
// ==========================================
class MathParser {
  private str: string;
  private pos = 0;
  private xVal: number;

  constructor(str: string, xVal: number) {
    // Normalise and replace common variants
    this.str = str
      .replace(/\s+/g, '')
      .toLowerCase()
      .replace(/π/g, 'pi');
    this.xVal = xVal;
  }

  private peek(): string {
    return this.pos < this.str.length ? this.str[this.pos] : '';
  }

  private next(): string {
    return this.pos < this.str.length ? this.str[this.pos++] : '';
  }

  parse(): number {
    if (!this.str) return 0;
    const val = this.parseExpression();
    if (this.pos < this.str.length) {
      throw new Error(`Unexpected character '${this.str[this.pos]}' at position ${this.pos}`);
    }
    return val;
  }

  private parseExpression(): number {
    let val = this.parseTerm();
    while (true) {
      const c = this.peek();
      if (c === '+') {
        this.next();
        val += this.parseTerm();
      } else if (c === '-') {
        this.next();
        val -= this.parseTerm();
      } else {
        break;
      }
    }
    return val;
  }

  private parseTerm(): number {
    let val = this.parseFactor();
    while (true) {
      const c = this.peek();
      if (c === '*') {
        this.next();
        val *= this.parseFactor();
      } else if (c === '/') {
        this.next();
        const denom = this.parseFactor();
        if (denom === 0) throw new Error("Division by zero");
        val /= denom;
      } else {
        break;
      }
    }
    return val;
  }

  private parseFactor(): number {
    let val = this.parsePower();
    if (this.peek() === '^') {
      this.next();
      val = Math.pow(val, this.parseFactor());
    }
    return val;
  }

  private parsePower(): number {
    const c = this.peek();
    if (c === '+') {
      this.next();
      return this.parsePower();
    }
    if (c === '-') {
      this.next();
      return -this.parsePower();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const c = this.peek();
    
    // Parse numbers
    if ((c >= '0' && c <= '9') || c === '.') {
      let numStr = '';
      while ((this.peek() >= '0' && this.peek() <= '9') || this.peek() === '.') {
        numStr += this.next();
      }
      return parseFloat(numStr);
    }
    
    // Handle parentheses
    if (c === '(') {
      this.next(); // Consume '('
      const val = this.parseExpression();
      if (this.next() !== ')') {
        throw new Error("Missing closing parenthesis");
      }
      return val;
    }

    // Variable x
    if (c === 'x') {
      this.next();
      return this.xVal;
    }

    // Functions & Constants
    if (c >= 'a' && c <= 'z') {
      let name = '';
      while (this.peek() >= 'a' && this.peek() <= 'z') {
        name += this.next();
      }

      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;

      // Function calls
      if (this.peek() === '(') {
        this.next(); // Consume '('
        const arg = this.parseExpression();
        if (this.next() !== ')') {
          throw new Error(`Missing closing parenthesis for function ${name}`);
        }
        
        switch (name) {
          case 'sin': return Math.sin(arg);
          case 'cos': return Math.cos(arg);
          case 'tan': return Math.tan(arg);
          case 'sqrt': 
            if (arg < 0) throw new Error("Negative square root");
            return Math.sqrt(arg);
          case 'abs': return Math.abs(arg);
          case 'ln': 
            if (arg <= 0) throw new Error("Log of zero/negative");
            return Math.log(arg);
          case 'log': 
            if (arg <= 0) throw new Error("Log of zero/negative");
            return Math.log10(arg);
          default: 
            throw new Error(`Unknown function: ${name}`);
        }
      }
      throw new Error(`Unknown constant or missing brackets: ${name}`);
    }

    throw new Error(`Invalid token: '${c}'`);
  }
}

export function evaluateExpression(expr: string, xVal: number = 0): number {
  const p = new MathParser(expr, xVal);
  return p.parse();
}

// ==========================================
// Calculator Interface
// ==========================================
interface AdvancedCalculatorProps {
  onClose: () => void;
}

export function AdvancedCalculator({ onClose }: AdvancedCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'scientific' | 'graphing' | 'vector'>('scientific');
  
  // 1. Scientific Tab State
  const [sciInput, setSciInput] = useState<string>('');
  const [sciResult, setSciResult] = useState<string>('');
  const [sciError, setSciError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([
    { expression: 'sin(pi/6) + cos(pi/3)', result: '1' },
    { expression: 'sqrt(16) * 3^2', result: '36' },
    { expression: 'log(100) + ln(e)', result: '3' }
  ]);

  // 2. Grapher State
  const [graphFunc, setGraphFunc] = useState<string>('sin(x) * cos(x/2)');
  const [graphError, setGraphError] = useState<string | null>(null);
  const [zoomFactor, setZoomFactor] = useState<number>(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Graph Presets
  const presets = [
    { name: 'Harmonic Pulse', formula: 'sin(x) * cos(x/2)' },
    { name: 'Geometry Sine Wave', formula: 'sin(x)' },
    { name: 'Symmetrical Cosine', formula: 'cos(x)' },
    { name: 'Quantum Parabola', formula: 'x^2 / 4 - 3' },
    { name: 'Damped Oscillator', formula: 'sin(x) / (1 + x^2/10)' },
    { name: 'Decaying Exponential', formula: 'abs(x) * 0.2' },
    { name: 'Polynomial Curve', formula: 'x^3/10 - x^2/2 - x + 2' }
  ];

  // 3. Vector State
  const [vecA, setVecA] = useState<{ x: number; y: number; z: number }>({ x: 1, y: 2, z: 2 });
  const [vecB, setVecB] = useState<{ x: number; y: number; z: number }>({ x: 3, y: -1, z: 0 });

  // Evaluation trigger for scientific
  const runScientificEval = () => {
    if (!sciInput.trim()) return;
    try {
      const res = evaluateExpression(sciInput, 0);
      const roundedRes = Number(res.toFixed(6)).toString(); // avoid long decimal junk
      setSciResult(roundedRes);
      setSciError(null);
      // Add to history
      setHistory(prev => [{ expression: sciInput, result: roundedRes }, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setSciError(err.message || 'Syntax Error');
      setSciResult('');
    }
  };

  // Keyboard button click handler
  const handleKeypadPress = (val: string) => {
    setSciError(null);
    if (val === 'C') {
      setSciInput('');
      setSciResult('');
    } else if (val === 'Del') {
      setSciInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      runScientificEval();
    } else {
      setSciInput(prev => prev + val);
    }
  };

  // Live calculation of vector metrics
  const calculateVectorMetrics = () => {
    // Magnitudes
    const magA = Math.sqrt(vecA.x * vecA.x + vecA.y * vecA.y + vecA.z * vecA.z);
    const magB = Math.sqrt(vecB.x * vecB.x + vecB.y * vecB.y + vecB.z * vecB.z);

    // Normalized
    const unitA = magA > 0 ? { x: vecA.x / magA, y: vecA.y / magA, z: vecA.z / magA } : { x: 0, y: 0, z: 0 };
    const unitB = magB > 0 ? { x: vecB.x / magB, y: vecB.y / magB, z: vecB.z / magB } : { x: 0, y: 0, z: 0 };

    // Addition
    const add = { x: vecA.x + vecB.x, y: vecA.y + vecB.y, z: vecA.z + vecB.z };

    // Dot Product
    const dot = vecA.x * vecB.x + vecA.y * vecB.y + vecA.z * vecB.z;

    // Cross Product
    const cross = {
      x: vecA.y * vecB.z - vecA.z * vecB.y,
      y: vecA.z * vecB.x - vecA.x * vecB.z,
      z: vecA.x * vecB.y - vecA.y * vecB.x
    };

    // Angle (degrees)
    let angleDeg = 0;
    if (magA > 0 && magB > 0) {
      const cosTheta = Math.max(-1, Math.min(1, dot / (magA * magB)));
      angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;
    }

    return { magA, magB, unitA, unitB, add, dot, cross, angleDeg };
  };

  const vecMetrics = calculateVectorMetrics();

  // Rendering Graphing Plane Canvas
  useEffect(() => {
    if (activeTab !== 'graphing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (dark theme obsidian)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Zoom setup
    const scaleX = 25 * zoomFactor; // pixels per unit
    const scaleY = 25 * zoomFactor;
    const originX = width / 2;
    const originY = height / 2;

    // Draw grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#71717a';

    // Vertical grid lines and X labels
    const step = 1;
    const maxUnitsX = Math.ceil(width / (scaleX * 2)) + 1;
    for (let i = -maxUnitsX; i <= maxUnitsX; i++) {
      const x = originX + i * scaleX;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Label
        if (i !== 0) {
          ctx.fillText(i.toString(), x - 4, originY + 12);
        }
      }
    }

    // Horizontal grid lines and Y labels
    const maxUnitsY = Math.ceil(height / (scaleY * 2)) + 1;
    for (let i = -maxUnitsY; i <= maxUnitsY; i++) {
      const y = originY - i * scaleY;
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Label
        if (i !== 0) {
          ctx.fillText(i.toString(), originX + 6, y + 3);
        }
      }
    }

    // Draw main axes (brighter glowing yellow)
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plotting the custom equation!
    ctx.strokeStyle = '#f59e0b'; // Amber-500
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();

    let first = true;
    let hasErrorOccurred = false;
    let lastErrorMessage = '';

    for (let pixelX = 0; pixelX < width; pixelX++) {
      // Calculate math x coordinate
      const mathX = (pixelX - originX) / scaleX;

      try {
        const mathY = evaluateExpression(graphFunc, mathX);
        const pixelY = originY - mathY * scaleY;

        if (pixelY >= 0 && pixelY <= height) {
          if (first) {
            ctx.moveTo(pixelX, pixelY);
            first = false;
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
        } else {
          // If out of bounds, break line
          first = true;
        }
      } catch (err: any) {
        hasErrorOccurred = true;
        lastErrorMessage = err.message || 'Error parsing graph';
        first = true; // Break connection on errors
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow for outer visuals

    if (hasErrorOccurred && graphFunc !== '') {
      setGraphError(lastErrorMessage);
    } else {
      setGraphError(null);
    }
  }, [graphFunc, activeTab, zoomFactor]);

  // Handle canvas mouse move to track coordinates
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    const scaleX = 25 * zoomFactor;
    const scaleY = 25 * zoomFactor;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;

    const mathX = (pixelX - originX) / scaleX;
    
    try {
      const mathY = evaluateExpression(graphFunc, mathX);
      setHoverCoord({ x: Number(mathX.toFixed(2)), y: Number(mathY.toFixed(2)) });
    } catch {
      setHoverCoord(null);
    }
  };

  return (
    <div id="calculator_visor_container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-zinc-950/95 border border-amber-500/30 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col h-[580px]"
      >
        {/* Glowing cyber header */}
        <div className="bg-zinc-900/80 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-400/30 flex items-center justify-center rounded-xl">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded uppercase tracking-wider">INSTRUMENT LEVEL 4</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">A.U.R.A MATH DEPLOYMENT</span>
              </div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase italic mt-0.5">ADVANCED SCIENTIFIC & GRAPHING SYSTEM</h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-white/5"
            title="Dismiss Console"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-zinc-950 px-6 py-2.5 flex items-center gap-2 border-b border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('scientific')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'scientific' 
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Scientific
          </button>
          
          <button
            onClick={() => setActiveTab('graphing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'graphing' 
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            Function Grapher
          </button>

          <button
            onClick={() => setActiveTab('vector')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'vector' 
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <Move3d className="w-3.5 h-3.5" />
            3D Vector Lab
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 min-h-0 bg-zinc-950/40 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: SCIENTIFIC CALCULATOR */}
            {activeTab === 'scientific' && (
              <motion.div
                key="scientific"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-stretch"
              >
                {/* Left Side Panel: Keyboard & Displays */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  {/* Digital Formula Glass Screen */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between min-h-[100px] relative overflow-hidden">
                    <div className="absolute right-3 top-3 text-[8px] font-mono uppercase tracking-widest text-zinc-500">INPUT MONITOR</div>
                    
                    {/* Active formula display */}
                    <input 
                      type="text"
                      value={sciInput}
                      onChange={(e) => {
                        setSciInput(e.target.value);
                        setSciError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') runScientificEval();
                      }}
                      placeholder="Enter expression (e.g. sin(pi/4) * sqrt(16))"
                      className="text-lg font-mono font-bold bg-transparent text-white outline-none w-full"
                    />

                    {/* Result or Error block */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2">
                      {sciError ? (
                        <span className="text-[11px] font-black uppercase text-red-400 flex items-center gap-1.5 font-mono">
                          <AlertCircle className="w-3.5 h-3.5" /> {sciError}
                        </span>
                      ) : (
                        <span className="text-xl font-mono font-black text-amber-400">
                          {sciResult ? `= ${sciResult}` : '0.00'}
                        </span>
                      )}
                      
                      {sciResult && (
                        <button
                          onClick={() => navigator.clipboard.writeText(sciResult)}
                          className="p-1 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-white/5 rounded-md hover:bg-white/10"
                        >
                          <Copy size={10} /> Copy
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scientific & Standard Keyboard Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {/* Scientific Trigonometry & Operations row */}
                    {[
                      'sin(', 'cos(', 'tan(', '(', ')',
                      'ln(', 'log(', 'sqrt(', '^', 'pi',
                      'e', 'abs(', '7', '8', '9',
                      '/', 'C', '4', '5', '6',
                      '*', 'Del', '1', '2', '3',
                      '-', '+', '0', '.', '='
                    ].map((btn) => {
                      const isOperator = ['/', '*', '-', '+', '='].includes(btn);
                      const isFunc = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt(', 'abs(', '^'].includes(btn);
                      const isClear = ['C', 'Del'].includes(btn);
                      
                      let btnStyle = "bg-zinc-900/60 border border-white/5 hover:border-white/20 text-zinc-300";
                      if (btn === '=') {
                        btnStyle = "bg-amber-500 text-zinc-950 font-black border-amber-400 hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] col-span-1";
                      } else if (isClear) {
                        btnStyle = "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20";
                      } else if (isOperator) {
                        btnStyle = "bg-zinc-850 border-white/10 text-amber-400 font-bold hover:bg-zinc-800";
                      } else if (isFunc) {
                        btnStyle = "bg-zinc-950 border border-zinc-800 text-orange-400 font-mono text-[10px] hover:border-orange-500/30";
                      }

                      return (
                        <button
                          key={btn}
                          onClick={() => handleKeypadPress(btn)}
                          className={`py-3 px-1 rounded-xl text-xs font-black tracking-wide flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btnStyle}`}
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side Panel: Presets & History Log */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  {/* Scientific Helper Guide */}
                  <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex-1 flex flex-col">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                      <BookOpen className="w-3.5 h-3.5 animate-pulse" />
                      Function Syntaxes
                    </span>
                    <div className="text-[10px] text-zinc-400 space-y-1.5 overflow-y-auto max-h-[140px] custom-scrollbar mb-4 border-b border-white/5 pb-2">
                      <p>• <span className="font-mono text-amber-300">sin(pi/2)</span> / <span className="font-mono text-amber-300">cos(pi)</span></p>
                      <p>• Power operation: use <span className="font-mono text-amber-300">x^2</span> or <span className="font-mono text-amber-300">2^3</span></p>
                      <p>• <span className="font-mono text-amber-300">ln(e)</span> natural logarithm of Euler</p>
                      <p>• <span className="font-mono text-amber-300">log(100)</span> log base 10</p>
                    </div>

                    {/* History */}
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">TELEMETRY CALCULATION LOG</span>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                      {history.length === 0 ? (
                        <div className="text-center py-6 text-zinc-600 text-[10px] font-bold uppercase">No records</div>
                      ) : (
                        history.map((record, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSciInput(record.expression);
                              setSciResult(record.result);
                              setSciError(null);
                            }}
                            className="w-full text-left p-2.5 bg-zinc-900/30 border border-white/5 hover:border-white/15 rounded-xl transition-all flex justify-between items-center cursor-pointer group"
                          >
                            <div className="truncate pr-2">
                              <span className="text-[9px] font-mono text-zinc-500 block">formula</span>
                              <span className="text-[10px] font-mono font-bold text-zinc-300 truncate group-hover:text-amber-400 block">{record.expression}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-mono text-zinc-500 block">value</span>
                              <span className="text-[10px] font-mono font-black text-amber-400 block">{record.result}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FUNCTION GRAPHER */}
            {activeTab === 'graphing' && (
              <motion.div
                key="graphing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-stretch"
              >
                {/* Visualizer Canvas */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  {/* Canvas block wrapper */}
                  <div className="relative border border-amber-500/20 rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={300}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={() => setHoverCoord(null)}
                      className="w-full h-[300px] cursor-crosshair"
                    />

                    {/* HUD Overlays */}
                    {hoverCoord && (
                      <div className="absolute bottom-4 left-4 bg-zinc-950/90 border border-amber-400/50 px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold text-white shadow-2xl flex items-center gap-3">
                        <span className="text-amber-400">CURSOR COORDINATE:</span>
                        <span>X: <span className="text-cyan-400">{hoverCoord.x}</span></span>
                        <span>Y: <span className="text-fuchsia-400">{hoverCoord.y}</span></span>
                      </div>
                    )}

                    {/* Scale Adjustment Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-zinc-950/85 border border-white/5 rounded-xl p-1.5">
                      <button 
                        onClick={() => setZoomFactor(prev => Math.max(0.2, prev - 0.2))}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-1.5 font-mono">Zoom: {Math.round(zoomFactor * 100)}%</span>
                      <button 
                        onClick={() => setZoomFactor(prev => Math.min(5, prev + 0.2))}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setZoomFactor(1)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Reset Scale"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Input field formula */}
                  <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5">
                    <span className="text-[10px] font-black text-amber-500 font-mono tracking-wider">f(x) =</span>
                    <input
                      type="text"
                      value={graphFunc}
                      onChange={(e) => {
                        setGraphFunc(e.target.value);
                      }}
                      placeholder="Input standard function of x, e.g. sin(x) / x"
                      className="flex-1 bg-transparent border-none outline-none font-mono text-xs font-bold text-white"
                    />
                    
                    {graphError ? (
                      <div className="text-[10px] font-black text-red-400 flex items-center gap-1 font-mono shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" /> Syntax Error
                      </div>
                    ) : (
                      <div className="text-[9px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-widest shrink-0 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Plotting Realtime
                      </div>
                    )}
                  </div>
                </div>

                {/* Function Presets List */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Function Presets
                    </span>
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-3.5">SELECT A PATTERN TO PLOT</span>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                      {presets.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setGraphFunc(p.formula)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                            graphFunc === p.formula 
                              ? 'bg-amber-500/10 border-amber-400 text-white' 
                              : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[9px] font-black uppercase tracking-wide text-white">{p.name}</span>
                            <TrendingUp className="w-3 h-3 text-amber-500" />
                          </div>
                          <span className="text-[9px] font-mono text-amber-400/80 mt-1 block">{p.formula}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: 3D VECTOR LAB */}
            {activeTab === 'vector' && (
              <motion.div
                key="vector"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-stretch animate-fade-in"
              >
                {/* Inputs area */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  {/* Vector A inputs */}
                  <div className="bg-zinc-950 border border-amber-500/20 p-4.5 rounded-2xl relative">
                    <div className="absolute right-3 top-3 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">3D VECTOR INPUT</div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      🟢 Vector A (X, Y, Z)
                    </span>
                    <div className="grid grid-cols-3 gap-3.5">
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component X</span>
                        <input
                          type="number"
                          value={vecA.x}
                          onChange={(e) => setVecA(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component Y</span>
                        <input
                          type="number"
                          value={vecA.y}
                          onChange={(e) => setVecA(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component Z</span>
                        <input
                          type="number"
                          value={vecA.z}
                          onChange={(e) => setVecA(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vector B inputs */}
                  <div className="bg-zinc-950 border border-amber-500/20 p-4.5 rounded-2xl relative">
                    <div className="absolute right-3 top-3 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">3D VECTOR INPUT</div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      🔵 Vector B (X, Y, Z)
                    </span>
                    <div className="grid grid-cols-3 gap-3.5">
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component X</span>
                        <input
                          type="number"
                          value={vecB.x}
                          onChange={(e) => setVecB(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component Y</span>
                        <input
                          type="number"
                          value={vecB.y}
                          onChange={(e) => setVecB(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Component Z</span>
                        <input
                          type="number"
                          value={vecB.z}
                          onChange={(e) => setVecB(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Matrix vector tutorial tips */}
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-2xl text-[9px] text-zinc-400 uppercase leading-relaxed font-bold">
                    💡 **Mathematics application:** Dot Product computes projection lengths and angles. Cross Product yields an orthogonal (perpendicular) vector representing normal planes.
                  </div>
                </div>

                {/* Operations results metrics */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex-1 flex flex-col">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Vector Calculation Outputs</span>

                    <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar">
                      {/* Vector Magnitude */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Magnitude |A|</span>
                          <span className="text-sm font-mono font-black text-amber-400">{vecMetrics.magA.toFixed(4)}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Magnitude |B|</span>
                          <span className="text-sm font-mono font-black text-cyan-400">{vecMetrics.magB.toFixed(4)}</span>
                        </div>
                      </div>

                      {/* Vector addition */}
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Addition (A + B)</span>
                          <span className="text-xs font-mono font-black text-white">
                            [{vecMetrics.add.x.toFixed(2)}, {vecMetrics.add.y.toFixed(2)}, {vecMetrics.add.z.toFixed(2)}]
                          </span>
                        </div>
                        <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">SUM</span>
                      </div>

                      {/* Dot Product */}
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Dot Product (A · B)</span>
                          <span className="text-sm font-mono font-black text-orange-400">{vecMetrics.dot.toFixed(4)}</span>
                        </div>
                        <span className="text-[8px] font-black bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-orange-400">SCALAR</span>
                      </div>

                      {/* Cross Product */}
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Cross Product (A × B)</span>
                          <span className="text-xs font-mono font-black text-amber-400">
                            [{vecMetrics.cross.x.toFixed(2)}, {vecMetrics.cross.y.toFixed(2)}, {vecMetrics.cross.z.toFixed(2)}]
                          </span>
                        </div>
                        <span className="text-[8px] font-black bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400">VECTOR</span>
                      </div>

                      {/* Angle Between Vectors */}
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase block">Angle Between Vectors (θ)</span>
                          <span className="text-sm font-mono font-black text-yellow-300">{vecMetrics.angleDeg.toFixed(2)}°</span>
                        </div>
                        <span className="text-[8px] font-black bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-yellow-400">TRIGONOMETRY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Visor telemetry footer status line */}
        <div className="bg-zinc-900/60 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase text-zinc-500 shrink-0 tracking-widest font-mono">
          <span>● CALCULATOR MODULE ONLINE</span>
          <span>SYSTEM CHIP V3.5-INTEGRATED</span>
          <span>LATENCY: 0.04MS</span>
        </div>

      </motion.div>
    </div>
  );
}
