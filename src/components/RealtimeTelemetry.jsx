import React, { useState, useEffect, useRef } from 'react';

const RealtimeTelemetry = () => {
  const [history, setHistory] = useState([
    { text: '==================================================', type: 'system' },
    { text: '   SAHAN PRAMUDITHA - MISSION CONTROL SHELL v1.0.0', type: 'system' },
    { text: '==================================================', type: 'system' },
    { text: '🚀 Booting core interfaces...', type: 'system' },
    { text: '✔ Firebase Authentication: ACTIVE', type: 'success' },
    { text: '✔ Firestore Production Database: HEALTHY', type: 'success' },
    { text: '✔ Google Analytics Telemetry Uplink: ACTIVE', type: 'success' },
    { text: '✔ NodeMailer SMTP Transporter: ONLINE', type: 'success' },
    { text: '💡 Type "help" to see available terminal commands.', type: 'info' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef(null);

  // Auto scroll to bottom of console
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    // Add command to history
    const newHistory = [...history, { text: `sahan@mission-control:~$ ${inputVal}`, type: 'input' }];

    // Process command
    switch (cmd) {
      case 'help':
        newHistory.push({
          text: 'Available commands:\n  • about      - Learn about Sahan\n  • skills     - Check tech stack & skills\n  • projects   - View highlighted projects\n  • contact    - Get email & social links\n  • smtp-test  - Run SMTP email diagnostics\n  • clear      - Clear the console screen',
          type: 'system',
        });
        break;
      case 'about':
        newHistory.push({
          text: 'Sahan Pramuditha — Full Stack Developer & Creative Engineer.\nSpecializing in building high-fidelity web experiences, cloud-native architectures, and premium user interfaces.',
          type: 'system',
        });
        break;
      case 'skills':
        newHistory.push({
          text: '⚙ Languages: JavaScript, TypeScript, Go, HTML5, CSS3\n⚙ Frameworks: React, Next.js, Vite, Node.js, Express\n⚙ Database/Cloud: Firebase Suite, Google Cloud Platform (GCP)\n⚙ Design: Glassmorphism, Responsive CSS, Framer Motion, Three.js',
          type: 'system',
        });
        break;
      case 'projects':
        newHistory.push({
          text: 'Highlighted Projects:\n  1. StudyOS - Web-based virtual operating system for productivity\n  2. template-portfolio-space - Premium reactive portfolio layout\n  3. GA4 Real-time Telemetry - Custom analytics reporting engine',
          type: 'system',
        });
        break;
      case 'contact':
        newHistory.push({
          text: '📧 Email: sahan.pramuditha.dev@gmail.com\n🔗 GitHub: github.com/SahanPramuditha-Dev\n💼 LinkedIn: linkedin.com/in/sahan-pramuditha',
          type: 'system',
        });
        break;
      case 'smtp-test':
        newHistory.push({ text: '⚡ Initiating SMTP Transporter Connection...', type: 'info' });
        setTimeout(() => {
          setHistory(prev => [
            ...prev,
            { text: '→ Resolving smtp.gmail.com...', type: 'system' },
            { text: '→ TCP Connection established on port 465.', type: 'system' },
            { text: '→ TLS Handshake secure (AES_256_GCM).', type: 'system' },
            { text: '✔ NodeMailer SMTP Transporter authentication successful.', type: 'success' },
            { text: '✔ Ready to dispatch contact inquiries.', type: 'success' }
          ]);
        }, 800);
        break;
      case 'clear':
        setHistory([]);
        setInputVal('');
        return;
      default:
        newHistory.push({ text: `shell: command not found: ${cmd}. Type "help" for help.`, type: 'error' });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div className="p-4 bg-primary/45 rounded-lg border border-secondary/40 md:col-span-2 flex flex-col justify-between h-[380px] min-w-0">
      <div className="h-full flex flex-col justify-between overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] uppercase tracking-widest text-accent mb-3 flex-shrink-0">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Interactive Developer Terminal
          </span>
          <span className="text-text-muted text-[8px] font-mono select-none">PORT: 5173</span>
        </div>

        {/* Shell Output Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[10px] leading-relaxed pr-1 mb-2 scrollbar-thin">
          {history.map((line, idx) => {
            let colorClass = 'text-text';
            if (line.type === 'success') colorClass = 'text-green-400';
            else if (line.type === 'error') colorClass = 'text-red-400';
            else if (line.type === 'info') colorClass = 'text-cyan-400';
            else if (line.type === 'system') colorClass = 'text-text-muted';
            else if (line.type === 'input') colorClass = 'text-text font-bold';

            return (
              <div key={idx} className={`${colorClass} whitespace-pre-wrap`}>
                {line.text}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        {/* Shell Input Area */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5 flex-shrink-0 font-mono text-[10px]">
          <span className="text-accent select-none shrink-0">sahan@mission-control:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text caret-cyan-400 w-full"
            placeholder="Type 'help'..."
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
};

export default RealtimeTelemetry;
