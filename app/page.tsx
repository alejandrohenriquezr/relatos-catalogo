        {ticks.map((value) => (
          <g key={value}>
            <line x1={pL} x2={w - pR} y1={y(value)} y2={y(value)} />
            <text x={pL - 9} y={y(value) + 4} textAnchor="end">
              {format(value)}
            </text>
          </g>
        ))}
        {points.map((point, index) =>
          index % labelStep === 0 || index === points.length - 1 ? (
            <text
              key={`${point.year}-${point.month}`}
              transform={`translate(${x(index)},${h - pB + 14}) rotate(-90)`}
              textAnchor="end"
            >
              {short(point)}
            </text>
          ) : null,
        )}
        <path className="line" d={line} style={{ stroke: "#123f87" }} />
        {points.map((point, index) => (
          <circle
            key={`${point.year}-${point.month}`}
            cx={x(index)}
            cy={y(point[metric])}
            r={index === points.length - 1 ? 4.5 : 3}
            fill="#123f87"
          >
            <title>
              {MONTHS[point.month]} {point.year}: {format(point[metric])}
            </title>
          </circle>
        ))}
      </svg>
      <div className="ipp-time-levels">
          <div className="ipp-time-quick" aria-label="Rangos históricos rápidos">
            <span>Ampliar período</span>
            <div>
              {[
                ["25", "25 períodos"],
                ["60", "5 años"],
                ["120", "10 años"],
                ["all", "Serie completa"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={!customRange && quickRange === value}
                  onClick={() =>
                    selectQuickRange(value as "25" | "60" | "120" | "all")
                  }
                >
                  {label}
