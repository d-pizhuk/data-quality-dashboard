import React, { useEffect, useRef } from 'react';

const LogoComp = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Increase resolution by setting canvas width and height to be higher
        const scale = 2; // Adjust scale as needed
        canvas.width = 500 * scale;
        canvas.height = 500 * scale;

        // Set canvas styles to match the display size
        canvas.style.width = '500px';
        canvas.style.height = '500px';

        // Scale context to match the canvas resolution
        ctx.scale(scale, scale);

        ctx.strokeStyle = '#282c34';
        ctx.lineWidth = 1.2;

        // Draw the 'A'
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(96.5, 50.5);
        ctx.moveTo(60, 100);
        ctx.lineTo(100, 100);
        ctx.stroke();

        // Draw the 'K'
        ctx.beginPath();
        ctx.moveTo(103.5, 100);
        ctx.lineTo(143, 63);
        ctx.moveTo(103.5, 100);
        ctx.lineTo(143, 137);
        ctx.stroke();

        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(100, 150);
        ctx.stroke();

        ctx.lineWidth = 1.2;
        // Draw the circles
        const radius = 8
        ctx.beginPath();
        ctx.arc(150, 50+radius+0.5, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(150, 150-radius-0.5, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }, []);

    return (
        <div className="symbol-container">
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default LogoComp;
