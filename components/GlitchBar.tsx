
import React from 'react';

const GlitchBar = () => {
  const barStyle: React.CSSProperties = {
    height: '2px',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  };

  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    height: '100%',
    width: '20%',
    backgroundColor: '#ffffff', // Accent color (White)
    boxShadow: '0 0 5px #ffffff, 0 0 10px #ffffff',
    animation: 'glitch-anim-1 4s infinite',
  };
  
  const line2Style: React.CSSProperties = {
    ...lineStyle,
    backgroundColor: '#ff00c1', // Magenta for glitch
    animation: 'glitch-anim-2 3s infinite',
    width: '5%',
  };
  
  const line3Style: React.CSSProperties = {
    ...lineStyle,
    backgroundColor: '#00c3ff', // Cyan for glitch
    animation: 'glitch-anim-3 5s infinite',
    width: '2%',
  };

  return (
    <>
      <style>{`
        @keyframes glitch-anim-1 {
          0% { transform: translateX(-100%); }
          10%, 100% { transform: translateX(500%); }
        }
        @keyframes glitch-anim-2 {
          0%, 20% { transform: translateX(-100%); }
          30%, 100% { transform: translateX(2000%); }
        }
         @keyframes glitch-anim-3 {
          0%, 40% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(5000%); }
        }
      `}</style>
      <div style={barStyle}>
        <div style={lineStyle}></div>
        <div style={line2Style}></div>
        <div style={line3Style}></div>
      </div>
    </>
  );
};

export default GlitchBar;
