import React, { useEffect, useRef } from 'react';

const KGBackground = () => {
    const canvasRef = useRef();

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');

        let nodes = [];
        let links = [];

        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = random(4, 15);
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#282c34';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        function initializeNodes() {
            let nodeCount = window.innerWidth*window.innerHeight/25000;
            nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                nodes.push(new Node(random(0, canvasRef.current.width), random(0, canvasRef.current.height)));
            }
        }

        function connectNodes() {
            links = [];
            const distanceThreshold = 130;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < distanceThreshold) {
                        links.push({ from: nodes[i], to: nodes[j], distance });
                    }
                }
            }
        }

        function drawLinks() {
            for (let link of links) {
                ctx.beginPath();
                ctx.moveTo(link.from.x, link.from.y);
                ctx.lineTo(link.to.x, link.to.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - link.distance / 130})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        function drawBackground() {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            connectNodes();
            drawLinks();

            for (let node of nodes) {
                node.draw();
            }
        }

        function onResize() {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            initializeNodes();
            drawBackground();
        }

        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;

        initializeNodes();
        drawBackground();

        window.addEventListener('resize', onResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <canvas ref={canvasRef} id={"backgroundCanvas"}></canvas>
    );
};

export default KGBackground;
