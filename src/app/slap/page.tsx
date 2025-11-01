"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';

type Pos = { x: number; y: number; vx: number; vy: number };

export default function MobileSlapGame() {
  
  const GAME_TIME = 30;
  const OBSTACLE_COUNT = 3;

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [hitAnim, setHitAnim] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 50, y: 50, vx: 0, vy: 0 });
  const [obstacles, setObstacles] = useState<Pos[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  // เพิ่ม state สำหรับแจ้งเตือน
  const [showWarning] = useState(false);
  const [jasmine, setJasmine] = useState<{ x: number; y: number } | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, down: false }); // เพิ่มใน MobileSlapGame

  const timerRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const spawnIntervalRef = useRef<number | null>(null);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("slapGameHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const moveHeadRandom = useCallback(() => {
    const x = 15 + Math.random() * 70;
    const y = 25 + Math.random() * 50;
    setPos((prev) => ({ ...prev, x, y }));
  }, []);

  const generateObstacles = useCallback(() => {
    const obs: Pos[] = [];
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      obs.push({
        x: 15 + Math.random() * 70,
        y: 25 + Math.random() * 50,
        vx: (Math.random() * 1.5 - 0.75),
        vy: (Math.random() * 1.5 - 0.75),
      });
    }
    setObstacles(obs);
  }, []);

  const animateObstacles = useCallback(() => {
    const step = () => {
      setObstacles((prev) =>
        prev.map((o) => {
          const nx = o.x + o.vx;
          const ny = o.y + o.vy;
          if (nx <= 10 || nx >= 85) o.vx = -o.vx;
          if (ny <= 20 || ny >= 70) o.vy = -o.vy;
          return {
            ...o,
            x: Math.max(10, Math.min(85, nx)),
            y: Math.max(20, Math.min(70, ny)),
          };
        })
      );
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  const playClickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 800 + combo * 50;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 100);
    } catch {}
  }, [combo]);

  const playGameOverSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.value = 150;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.frequency.value = 100;
      }, 200);
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 500);
    } catch {}
  }, []);

  const handleGameOver = useCallback(() => {
    setRunning(false);
    setGameOver(true);
    setCombo(0);
    playGameOverSound();

    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("slapGameHighScore", score.toString());
    }
  }, [score, highScore, playGameOverSound]);

  // const checkCollision = useCallback(
  //   (headPos: Pos) => {
  //     // เพิ่มขนาดพื้นที่ชน
  //     const HEAD_RADIUS = 25; // เพิ่มจาก 10
  //     const OBSTACLE_RADIUS = 25; // เพิ่มจาก 12
      
  //     return obstacles.some((o) => {
  //       // คำนวณระยะห่างระหว่างจุดศูนย์กลาง
  //       const dx = Math.abs(headPos.x - o.x);
  //       const dy = Math.abs(headPos.y - o.y);
  //       const distance = Math.sqrt(dx * dx + dy * dy);
        
  //       // ถ้าระยะห่างน้อยกว่าผลรวมของรัศมี = ชนกัน
  //       return distance < (HEAD_RADIUS + OBSTACLE_RADIUS);
  //     });
  //   },
  //   [obstacles]
  // );

  // ลบ checkCollision ออกจาก handleSlap
  const handleSlap = useCallback(
    (e?: React.TouchEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!running) return;
      
      const newScore = score + 1;
      setScore(newScore);
      setCombo(combo + 1);
      setHitAnim(true);
      playClickSound();

      if (navigator.vibrate) navigator.vibrate(50);

      setTimeout(() => {
        setHitAnim(false);
        moveHeadRandom();
      }, 150);
    },
    [running, score, combo, playClickSound, moveHeadRandom]
  );

  // เพิ่ม handler สำหรับแตะลูกบอล
  const handleObstacleClick = useCallback(() => {
    if (!running) return;
    handleGameOver();
  }, [running, handleGameOver]);

  const handleJasmineClick = useCallback(() => {
    setScore((s) => s + 5); // ได้คะแนนเพิ่ม 5
    setJasmine(null); // มะลิหายไปหลังแตะ
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setRunning(true);
    setGameOver(false);
    setShowStartScreen(false);
    setCombo(0);
    setObstacles([]); // <-- เคลียร์ลูกบอลทั้งหมดก่อนเริ่มใหม่
    moveHeadRandom();
    generateObstacles();
    animateObstacles();
    // Reset spawn interval ref
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  }, [moveHeadRandom, generateObstacles, animateObstacles]);

  // Timer
  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, handleGameOver]);

  // Spawn additional obstacles only when entering last 15 seconds
  useEffect(() => {
    if (!running) return;

    // เริ่ม spawn ถ้าเวลา <= 15
    if (timeLeft <= 15 && timeLeft > 0) {
      if (!spawnIntervalRef.current) {
        console.log("🔥 เริ่ม spawn ลูกบอลเพิ่มทุก 2 วิ");

        spawnIntervalRef.current = window.setInterval(() => {
          setObstacles((prev) => [
            ...prev,
            {
              x: 15 + Math.random() * 70,
              y: 25 + Math.random() * 50,
              vx: Math.random() * 1.5 - 0.75,
              vy: Math.random() * 1.5 - 0.75,
            },
          ]);
        }, 2000); // 2000 = 2 วินาที, เปลี่ยนเป็น 1000 จะเพิ่มทุก 1 วินาที
      }
    } else {
      // หยุด spawn ถ้าเวลา > 15 หรือหมดเวลา
     if (!spawnIntervalRef.current) {
        console.log("🔥 เริ่ม spawn ลูกบอลเพิ่มทุก 2 วิ");

        spawnIntervalRef.current = window.setInterval(() => {
          setObstacles((prev) => [
            ...prev,
            {
              x: 15 + Math.random() * 70,
              y: 25 + Math.random() * 50,
              vx: Math.random() * 1.5 - 0.75,
              vy: Math.random() * 1.5 - 0.75,
            },
          ]);
        }, 2000); // 2000 = 2 วินาที, เปลี่ยนเป็น 1000 จะเพิ่มทุก 1 วินาที
      }
    }

    // cleanup ตอน component unmount หรือ dependency เปลี่ยน
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
        console.log("🧹 Cleanup spawn interval");
      }
    };
  }, [timeLeft, running]);

  // Randomly spawn jasmine every 10 seconds
  useEffect(() => {
    if (!running) {
      setJasmine(null);
      return;
    }
    const jasmineTimeout = window.setTimeout(() => {
      setJasmine({
        x: 15 + Math.random() * 70,
        y: 25 + Math.random() * 50,
      });
    }, 10000); // 10 seconds after the game starts
    return () => clearTimeout(jasmineTimeout);
  }, [running, timeLeft]);

  // Prevent zoom
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchstart", preventDefault, { passive: false });
    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => {
      document.removeEventListener("touchstart", preventDefault);
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  if (showStartScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-4">
        <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-8 shadow-2xl max-w-sm mx-auto">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">ตบหัวโล้น</h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            แตะหัวโล้นให้ได้มากที่สุด<br />
            หลีกเลี่ยงสี่เหลี่ยมสีน้ำเงิน!
          </p>
          {highScore > 0 && (
            <div className="mb-6 p-3 bg-yellow-100 rounded-lg">
              <div className="text-sm text-gray-600">คะแนนสูงสุด</div>
              <div className="text-2xl font-bold text-yellow-600">{highScore}</div>
            </div>
          )}
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            เริ่มเกม! 🎮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 to-indigo-300 p-2 select-none">
      {/* Top UI */}
      <div className="flex items-center justify-between mb-2 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-xs text-gray-600">คะแนน</div>
          </div>
          {combo > 1 && (
            <div className="text-center animate-pulse">
              <div className="text-lg font-bold text-orange-500">x{combo}</div>
              <div className="text-xs text-orange-600">Combo!</div>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-red-500">{timeLeft}</div>
          <div className="text-xs text-gray-600">วินาที</div>
        </div>
        <button
          onClick={() => {
            setRunning(false);
            setShowStartScreen(true);
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
          }}
          className="px-4 py-2 bg-red-400 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          หยุด
        </button>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl shadow-2xl overflow-hidden touch-none"
        style={{
          height: "calc(100vh - 120px)",
          minHeight: "400px",
        }}
        onMouseMove={e => setMouse(m => ({ ...m, x: e.clientX, y: e.clientY }))}
        onMouseDown={() => setMouse(m => ({ ...m, down: true }))}
        onMouseUp={() => setMouse(m => ({ ...m, down: false }))}
      >
        {/* Obstacles */}
        {obstacles.map((o, idx) => (
          <div
            key={idx}
            className="absolute cursor-pointer"
            style={{ 
              left: `${o.x}%`, 
              top: `${o.y}%`, 
              width: "50px", 
              height: "50px" 
            }}
            onClick={handleObstacleClick}
            onTouchStart={handleObstacleClick}
          >
            <div className="w-full h-full bg-blue-600"></div>
          </div>
        ))}

        {/* Moving Head */}
        <div
          onTouchStart={handleSlap}
          onClick={handleSlap}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
            hitAnim ? "scale-90 rotate-12" : "hover:scale-105"
          }`}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            filter: hitAnim ? "brightness(1.2)" : "none",
            cursor: "none",
          }}
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-lg opacity-50 animate-pulse scale-125"></div>
            <Image 
              src="/slap/blad.png"
              alt="หัวล้าน"
              width={96}
              height={96}
              className="drop-shadow-lg relative z-10 w-full h-full"
              priority
              unoptimized
            />
          </div>
          {hitAnim && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg font-bold text-yellow-600 animate-bounce pointer-events-none">
              +1
            </div>
          )}
        </div>

        {/* Jasmine Flower */}
        {jasmine && (
          <div
            className="absolute cursor-pointer"
            style={{
              left: `${jasmine.x}%`,
              top: `${jasmine.y}%`,
              width: "40px",
              height: "40px",
              zIndex: 20,
            }}
            onClick={handleJasmineClick}
            onTouchStart={handleJasmineClick}
          >
            {/* ใช้ emoji หรือ svg ดอกมะลิ */}
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ fontSize: 32 }}>🌼</span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="relative mx-4 w-full max-w-sm">
              <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-br from-fuchsia-500/60 via-amber-400/60 to-sky-500/60 blur"></div>
              <div className="relative rounded-[24px] bg-white/95 dark:bg-white p-7 text-center shadow-2xl">
                <div className="mx-auto mb-4 grid place-items-center">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-white grid place-items-center shadow-lg animate-pulse">
                    <span className="text-3xl">💥</span>
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-red-600">เกมจบแล้ว!</h2>
                <p className="text-base text-gray-600 mb-4">ลองอีกครั้งเพื่อทำลายสถิติของคุณ</p>
                <div className="mb-5 space-y-2">
                  <p className="text-2xl font-semibold">
                    คะแนน: <span className="font-black text-blue-600 drop-shadow-sm">{score}</span>
                  </p>
                  {score === highScore && score > 0 && (
                    <p className="text-sm text-yellow-600 font-semibold flex items-center justify-center gap-2">
                      <span>🎉</span> <span>สถิติใหม่!</span>
                    </p>
                  )}
                  {highScore > 0 && score !== highScore && (
                    <p className="text-xs text-gray-500">สูงสุด: {highScore}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    เล่นอีก! <span className="ml-1">🎮</span>
                  </button>
                  <button
                    onClick={() => setShowStartScreen(true)}
                    className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold shadow-inner hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    หลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {showWarning && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-red-600 text-lg font-bold animate-pulse">
            ⚠️ ระวัง! ลูกบอลเพิ่มขึ้น!
          </div>
        )}

        {/* Custom Cursor */}
        <div
          style={{
            position: "fixed",
            left: mouse.x - 75, // ถ้ารูป 150x150px
            top: mouse.y - 75,
            width: 150,
            height: 150,
            pointerEvents: "none",
            zIndex: 9999,
            transform: mouse.down ? "rotate(30deg) scale(1.1)" : "none",
            transition: "transform 0.1s",
            display: mouse.x === 0 && mouse.y === 0 ? "none" : "block",
          }}
        >
          <Image src="/slap/hand.png" width={150} height={150} alt="hand" draggable={false} />
        </div>
      </div>
    </div>
  );
}
