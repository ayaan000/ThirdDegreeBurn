// Supernova Light Curve Simulator
// Physics-based simulation of supernova photometry

(function () {
    'use strict';

    const plotContainer = document.getElementById('lightCurvePlot');
    const typeSelect = document.getElementById('supernovaType');
    const peakSlider = document.getElementById('peakLuminosity');
    const peakDisplay = document.getElementById('peakDisplay');
    const decaySlider = document.getElementById('decayRate');
    const decayDisplay = document.getElementById('decayDisplay');
    const riseSlider = document.getElementById('riseTime');
    const riseDisplay = document.getElementById('riseDisplay');
    const addCurveBtn = document.getElementById('addCurve');
    const clearCurvesBtn = document.getElementById('clearCurves');

    if (!plotContainer) return;

    let canvas, ctx;
    let width, height;
    let curves = []; // Store multiple curves for comparison

    // Supernova templates
    const templates = {
        'Ia': { rise: 15, decay: 2.0, peak: 10, color: '#4A90E2' },
        'IIP': { rise: 20, decay: 1.2, peak: 8, color: '#E27B58' },
        'IIL': { rise: 18, decay: 3.5, peak: 7, color: '#50C878' },
        'Ib': { rise: 12, decay: 2.8, peak: 9, color: '#9B59B6' }
    };

    function init() {
        canvas = document.createElement('canvas');
        plotContainer.appendChild(canvas);
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Load template on type change
        if (typeSelect) {
            typeSelect.addEventListener('change', loadTemplate);
            loadTemplate(); // Load initial template
        }

        // Update displays
        if (peakSlider && peakDisplay) {
            peakSlider.addEventListener('input', (e) => {
                peakDisplay.textContent = e.target.value;
            });
        }

        if (decaySlider && decayDisplay) {
            decaySlider.addEventListener('input', (e) => {
                decayDisplay.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        if (riseSlider && riseDisplay) {
            riseSlider.addEventListener('input', (e) => {
                riseDisplay.textContent = e.target.value;
            });
        }

        // Buttons
        if (addCurveBtn) {
            addCurveBtn.addEventListener('click', addCurrentCurve);
        }

        if (clearCurvesBtn) {
            clearCurvesBtn.addEventListener('click', () => {
                curves = [];
                draw();
            });
        }

        draw();
    }

    function loadTemplate() {
        const type = typeSelect ? typeSelect.value : 'Ia';
        const template = templates[type];

        if (riseSlider) riseSlider.value = template.rise;
        if (riseDisplay) riseDisplay.textContent = template.rise;
        if (decaySlider) decaySlider.value = template.decay;
        if (decayDisplay) decayDisplay.textContent = template.decay.toFixed(1);
        if (peakSlider) peakSlider.value = template.peak;
        if (peakDisplay) peakDisplay.textContent = template.peak;

        draw();
    }

    function addCurrentCurve() {
        const type = typeSelect ? typeSelect.value : 'Ia';
        const rise = parseFloat(riseSlider ? riseSlider.value : 15);
        const decay = parseFloat(decaySlider ? decaySlider.value : 2);
        const peak = parseFloat(peakSlider ? peakSlider.value : 10);

        curves.push({
            type,
            rise,
            decay,
            peak,
            color: templates[type].color,
            label: `Type ${type} (R=${rise}d, D=${decay.toFixed(1)})`
        });

        draw();
    }

    function calculateLightCurve(params, maxDays = 200) {
        const { rise, decay, peak } = params;
        const points = [];
        const timeStep = 1; // 1 day resolution

        for (let day = 0; day <= maxDays; day += timeStep) {
            let magnitude;

            if (day < rise) {
                // Rising phase - exponential approach to peak
                const t = day / rise;
                magnitude = -peak * (1 - Math.exp(-3 * t));
            } else {
                // Decline phase - exponential decay
                const daysSincePeak = day - rise;
                const decayConstant = decay / 100; // mag per day
                magnitude = -peak + decayConstant * daysSincePeak;
            }

            // Convert to absolute magnitude (more negative = brighter)
            points.push({ day, magnitude });
        }

        return points;
    }

    function resize() {
        const rect = plotContainer.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        draw();
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Margins
        const margin = { top: 40, right: 40, bottom: 60, left: 70 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Get current curve for preview
        const currentParams = {
            rise: parseFloat(riseSlider ? riseSlider.value : 15),
            decay: parseFloat(decaySlider ? decaySlider.value : 2),
            peak: parseFloat(peakSlider ? peakSlider.value : 10)
        };
        const previewCurve = calculateLightCurve(currentParams);

        // Collect all curves to determine axis ranges
        const allCurves = [
            { points: previewCurve, color: '#ffa500', label: 'Current (preview)', dashed: true },
            ...curves.map(c => ({ points: calculateLightCurve(c), color: c.color, label: c.label }))
        ];

        if (allCurves.length === 0) return;

        // Find data ranges
        const allPoints = allCurves.flatMap(c => c.points);
        const maxDay = Math.max(...allPoints.map(p => p.day));
        const minMag = Math.min(...allPoints.map(p => p.magnitude));
        const maxMag = Math.max(...allPoints.map(p => p.magnitude));

        function scaleX(day) {
            return margin.left + (day / maxDay) * plotWidth;
        }

        function scaleY(magnitude) {
            // Note: in astronomy, smaller magnitude = brighter (inverted)
            return margin.top + ((magnitude - minMag) / (maxMag - minMag)) * plotHeight;
        }

        // Draw axes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = '#aaa';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Days Since Explosion', width / 2, height - margin.bottom + 40);

        ctx.save();
        ctx.translate(margin.left - 50, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Absolute Magnitude (brighter ↑)', 0, 0);
        ctx.restore();

        // Grid lines
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        for (let i = 0; i <= 5; i++) {
            const x = margin.left + (i / 5) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, height - margin.bottom);
            ctx.stroke();

            // X-axis tick labels
            ctx.fillStyle = '#888';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round((i / 5) * maxDay), x, height - margin.bottom + 20);
        }

        for (let i = 0; i <= 5; i++) {
            const y = margin.top + (i / 5) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();

            // Y-axis tick labels
            const magValue = minMag + (i / 5) * (maxMag - minMag);
            ctx.textAlign = 'right';
            ctx.fillText(magValue.toFixed(1), margin.left - 10, y + 4);
        }
        ctx.setLineDash([]);

        // Draw light curves
        allCurves.forEach(curveData => {
            const { points, color, dashed } = curveData;

            ctx.strokeStyle = color;
            ctx.lineWidth = dashed ? 2 : 3;
            if (dashed) ctx.setLineDash([6, 4]);

            ctx.beginPath();
            points.forEach((point, i) => {
                const x = scaleX(point.day);
                const y = scaleY(point.magnitude);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            if (dashed) ctx.setLineDash([]);
        });

        // Legend
        const legendX = margin.left + 20;
        let legendY = margin.top + 20;

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('Light Curves:', legendX, legendY);
        legendY += 20;

        allCurves.forEach(curveData => {
            const { color, label, dashed } = curveData;

            ctx.strokeStyle = color;
            ctx.lineWidth = dashed ? 2 : 3;
            if (dashed) ctx.setLineDash([6, 4]);

            ctx.beginPath();
            ctx.moveTo(legendX, legendY);
            ctx.lineTo(legendX + 30, legendY);
            ctx.stroke();

            if (dashed) ctx.setLineDash([]);

            ctx.fillStyle = '#ccc';
            ctx.font = '11px Arial';
            ctx.fillText(label, legendX + 40, legendY + 4);
            legendY += 18;
        });

        // Peak brightness annotation for preview
        if (previewCurve.length > 0) {
            const peakPoint = previewCurve.reduce((prev, curr) =>
                curr.magnitude < prev.magnitude ? curr : prev
            );
            const px = scaleX(peakPoint.day);
            const py = scaleY(peakPoint.magnitude);

            ctx.fillStyle = '#ffa500';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffa500';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Peak: ${peakPoint.magnitude.toFixed(1)} mag`, px, py - 12);
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
