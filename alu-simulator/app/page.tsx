'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, Zap, Info } from 'lucide-react';

export default function ALUSimulator() {
  // --- STATE MANAGEMENT ---
  const [a, setA] = useState([0, 0, 0, 0]);
  const [b, setB] = useState([0, 0, 0, 0]);
  const [op, setOp] = useState('000'); // Default to ADD
  
  const [result, setResult] = useState([0, 0, 0, 0]);
  const [carryFlag, setCarryFlag] = useState(0);
  const [zeroFlag, setZeroFlag] = useState(1);
  const [explanation, setExplanation] = useState('');

  // Operations Map based on your Syllabus mapping
  const operations = [
    { code: '000', name: 'ADD', symbol: '+', desc: 'Addition (A + B)' },
    { code: '001', name: 'SUB', symbol: '-', desc: "Subtraction via 2's Complement (A + ~B + 1)" },
    { code: '010', name: 'AND', symbol: '&', desc: 'Logical AND (A & B)' },
    { code: '011', name: 'OR', symbol: '|', desc: 'Logical OR (A | B)' },
    { code: '100', name: 'XOR', symbol: '^', desc: 'Logical XOR (A ^ B)' },
    { code: '101', name: 'SHL', symbol: '<<', desc: 'Shift Left A by 1 bit' },
    { code: '110', name: 'SHR', symbol: '>>', desc: 'Shift Right A by 1 bit' },
  ];

  // --- HELPER FUNCTIONS ---
  const binToDec = (arr) => parseInt(arr.join(''), 2);
  const decToBinArr = (dec) => dec.toString(2).padStart(4, '0').split('').map(Number);
  
  const toggleBit = (setter, currentArr, index) => {
    const newArr = [...currentArr];
    newArr[index] = newArr[index] === 0 ? 1 : 0;
    setter(newArr);
  };

  // --- CORE ALU LOGIC ENGINE ---
  useEffect(() => {
    const valA = binToDec(a);
    const valB = binToDec(b);
    let resDec = 0;
    let carry = 0;
    let explText = '';

    switch (op) {
      case '000': // ADD
        resDec = valA + valB;
        carry = resDec > 15 ? 1 : 0;
        explText = `Added ${valA} and ${valB}. If the sum exceeds 15 (1111 in binary), the Carry Flag is set.`;
        break;
      case '001': // SUB
        resDec = valA - valB;
        carry = valA < valB ? 1 : 0; // Borrow
        if (resDec < 0) resDec = (resDec + 16) % 16; // Wrap for 4-bit 2's complement
        explText = `Subtracted ${valB} from ${valA}. The hardware uses 2's complement: it inverts B and adds 1, then adds it to A.`;
        break;
      case '010': // AND
        resDec = valA & valB;
        explText = `Bitwise AND. Outputs 1 only if both corresponding bits in A and B are 1.`;
        break;
      case '011': // OR
        resDec = valA | valB;
        explText = `Bitwise OR. Outputs 1 if either corresponding bit in A or B is 1.`;
        break;
      case '100': // XOR
        resDec = valA ^ valB;
        explText = `Bitwise XOR. Outputs 1 only if the corresponding bits in A and B are different.`;
        break;
      case '101': // SHL
        resDec = valA << 1;
        carry = (valA & 8) !== 0 ? 1 : 0; // Check if MSB is 1
        explText = `Shifted A (${valA}) left by 1 bit. Equivalent to multiplying by 2. The leftmost bit falls into the Carry flag.`;
        break;
      case '110': // SHR
        resDec = valA >> 1;
        explText = `Shifted A (${valA}) right by 1 bit. Equivalent to dividing by 2.`;
        break;
      default:
        break;
    }

    // Hardware limitation: strictly mask to 4 bits
    const finalRes = resDec & 0xF;
    
    setResult(decToBinArr(finalRes));
    setCarryFlag(carry);
    setZeroFlag(finalRes === 0 ? 1 : 0);
    setExplanation(explText);
    
  }, [a, b, op]);

  // --- UI COMPONENTS ---
  const BitToggle = ({ bit, onClick, label }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-slate-400">{label}</span>
      <button
        onClick={onClick}
        className={`w-12 h-16 rounded-lg font-bold text-2xl transition-all duration-200 shadow-lg border border-slate-700
          ${bit === 1 
            ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20 border-emerald-500/50' 
            : 'bg-slate-800 text-slate-600 hover:bg-slate-700'}`}
      >
        {bit}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono flex flex-col items-center">
      
      {/* Header */}
      <header className="max-w-4xl w-full mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Cpu className="text-emerald-500" size={32} />
            4-Bit ALU Simulator
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Design & Simulation of an Arithmetic Logic Unit</p>
        </div>
      </header>

      <main className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Hardware */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
            <Zap size={18} className="text-amber-500"/> Input Signals
          </h2>
          
          {/* Operand A */}
          <div className="flex items-center justify-between mb-8 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            <div className="flex gap-3">
              {a.map((bit, idx) => (
                <BitToggle key={`a-${idx}`} bit={bit} label={`A${3-idx}`} onClick={() => toggleBit(setA, a, idx)} />
              ))}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Decimal A</div>
              <div className="text-3xl font-bold text-emerald-400">{binToDec(a)}</div>
            </div>
          </div>

          {/* Operand B */}
          <div className="flex items-center justify-between mb-8 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            <div className="flex gap-3">
              {b.map((bit, idx) => (
                <BitToggle key={`b-${idx}`} bit={bit} label={`B${3-idx}`} onClick={() => toggleBit(setB, b, idx)} />
              ))}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Decimal B</div>
              <div className="text-3xl font-bold text-emerald-400">{binToDec(b)}</div>
            </div>
          </div>

          {/* Result Output */}
          <div className="mt-10 border-t border-slate-800 pt-8">
            <h2 className="text-sm text-slate-500 mb-4 uppercase tracking-wider">4-Bit Result Output</h2>
            <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-xl">
               <div className="flex gap-3">
                {result.map((bit, idx) => (
                  <div key={`r-${idx}`} className={`w-12 h-16 rounded-lg flex items-center justify-center font-bold text-2xl border 
                    ${bit === 1 ? 'bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                    {bit}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <ArrowRight className="text-slate-600" />
                <div className="text-5xl font-black text-white">{binToDec(result)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Control & Status */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Operation Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm text-slate-500 mb-4 uppercase tracking-wider">Control Signal (Opcode)</h2>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((operation) => (
                <button
                  key={operation.code}
                  onClick={() => setOp(operation.code)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all border text-left flex justify-between items-center
                    ${op === operation.code 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                >
                  <span>{operation.name}</span>
                  <span className="text-xs opacity-60 font-mono">{operation.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Flags */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex gap-4">
             <div className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                ${carryFlag === 1 ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                <div className="text-xs uppercase tracking-wider font-bold">Carry / Overflow</div>
                <div className="text-2xl font-black">{carryFlag}</div>
             </div>
             <div className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                ${zeroFlag === 1 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                <div className="text-xs uppercase tracking-wider font-bold">Zero Flag</div>
                <div className="text-2xl font-black">{zeroFlag}</div>
             </div>
          </div>

          {/* Micro-operations Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1">
             <h2 className="text-sm text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
               <Info size={16}/> Active Micro-operation
             </h2>
             <div className="text-slate-300 leading-relaxed text-sm">
                <p className="mb-2 font-semibold text-indigo-400">
                  {operations.find(o => o.code === op)?.desc}
                </p>
                <p className="opacity-80 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-4">
                  {explanation}
                </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}