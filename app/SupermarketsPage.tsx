        ? { value: true, monthly: false, annual: false, accumulated: false }
        : { monthly: true, annual: true, accumulated: true };
      return initial;
    });
  const toggle = (key: string) =>
    setVisible((old) => toggleChartSeries(old, key, hasValue));
  const temporalPresets: TemporalPreset[] = [
    { value: 25, label: "25 períodos" },
    { value: 60, label: "5 años" },
    { value: 120, label: "10 años" },
    { value: "all", label: "Serie completa" },
  ];
  const temporal = useTemporalWindow(
    series,
    series.map((point) => point.label),
    temporalPresets,
    13,
  );
  const usable = temporal.visible,
    keys = Object.keys(allLabels),
    activeKeys = keys.filter((key) => visible[key]),
    values = usable.flatMap((point) =>
      activeKeys.map((key) => point[key]).filter(Number.isFinite),
    ),
    levelMode = hasValue && visible.value,
    lo = Math.min(...values, ...(levelMode ? [] : [0])),
