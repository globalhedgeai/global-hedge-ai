"use client";
import React, { useEffect, useRef } from "react";

type Candle = { time:number; open:number; high:number; low:number; close:number; volume?:number };

export default function CandlesChart({
  candles, height = 420
}:{ candles: Candle[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (!containerRef.current || !candles || candles.length === 0) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    try {
      // Create a simple SVG chart
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', height.toString());
      svg.setAttribute('viewBox', `0 0 800 ${height}`);
      svg.style.backgroundColor = '#0b1426';
      svg.style.borderRadius = '8px';

      if (candles.length === 0) {
        // Show no data message
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '400');
        text.setAttribute('y', (height / 2).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '16');
        text.textContent = 'لا توجد بيانات متاحة';
        svg.appendChild(text);
        containerRef.current.appendChild(svg);
        return;
      }

      // Calculate chart dimensions
      const padding = 40;
      const chartWidth = 800 - (padding * 2);
      const chartHeight = height - (padding * 2);

      // Find min/max values
      const prices = candles.map(c => [c.high, c.low]).flat();
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;

      // Price scale function
      const priceToY = (price: number) => {
        return chartHeight - ((price - minPrice) / priceRange) * chartHeight + padding;
      };

      // Time scale function
      const timeToX = (index: number) => {
        return (index / (candles.length - 1)) * chartWidth + padding;
      };

      // Draw grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', (800 - padding).toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', '#1e293b');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      }

      // Draw candlesticks (real candlesticks, not line chart)
      candles.forEach((candle, index) => {
        const x = timeToX(index);
        const openY = priceToY(candle.open);
        const closeY = priceToY(candle.close);
        const highY = priceToY(candle.high);
        const lowY = priceToY(candle.low);

        const isGreen = candle.close > candle.open;
        const color = isGreen ? '#10b981' : '#ef4444';

        // High-Low line (wick)
        const hlLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hlLine.setAttribute('x1', x.toString());
        hlLine.setAttribute('y1', highY.toString());
        hlLine.setAttribute('x2', x.toString());
        hlLine.setAttribute('y2', lowY.toString());
        hlLine.setAttribute('stroke', color);
        hlLine.setAttribute('stroke-width', '1');
        svg.appendChild(hlLine);

        // Open-Close rectangle (body)
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', (x - 3).toString());
        rect.setAttribute('y', Math.min(openY, closeY).toString());
        rect.setAttribute('width', '6');
        rect.setAttribute('height', Math.abs(closeY - openY).toString());
        rect.setAttribute('fill', color);
        svg.appendChild(rect);

        // If open and close are the same, draw a line
        if (Math.abs(openY - closeY) < 1) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', (x - 3).toString());
          line.setAttribute('y1', openY.toString());
          line.setAttribute('x2', (x + 3).toString());
          line.setAttribute('y2', closeY.toString());
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
        }
      });

      // Add current price text
      if (candles.length > 0) {
        const currentPrice = candles[candles.length - 1].close;
        const priceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        priceText.setAttribute('x', '20');
        priceText.setAttribute('y', '30');
        priceText.setAttribute('fill', '#ffffff');
        priceText.setAttribute('font-size', '14');
        priceText.setAttribute('font-weight', 'bold');
        priceText.textContent = `السعر الحالي: $${currentPrice.toFixed(2)}`;
        svg.appendChild(priceText);
      }

      containerRef.current.appendChild(svg);
      console.log('✅ Real candlestick chart created successfully');

    } catch (error) {
      console.error('Error creating candlestick chart:', error);
      
      // Fallback: show simple text
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.cssText = `
        width: 100%;
        height: ${height}px;
        background: #0b1426;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 16px;
        border: 1px solid #1e293b;
      `;
      fallbackDiv.textContent = `الرسوم البيانية: ${candles.length} شمعة`;
      containerRef.current.appendChild(fallbackDiv);
    }
  }, [candles, height]);

  return <div ref={containerRef} className="w-full rounded-xl border p-2" />;
}
