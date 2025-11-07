
"use client";

import { useState, useMemo, useTransition } from "react";
import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/india-data";
import {
  BarChart as BarChartIcon,
  Bug,
  Info,
  Loader2,
  Map,
  Microscope,
  ShieldCheck,
  PieChart as PieChartIcon,
  Target,
  TrendingUp,
  GitCompare,
  CalendarDays,
  LocateFixed,
  Droplets,
  PlusCircle,
} from "lucide-react";
import {
  simulateMalariaRates,
  type SimulateMalariaRatesOutput,
} from "@/ai/flows/simulate-malaria-rates";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";

const availableYears = Array.from({ length: 15 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const intensityStyles: { [key: string]: string } = {
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
  Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Very High": "bg-red-500/20 text-red-400 border-red-500/30",
};

const intensityHeatMapStyles: { [key: string]: string } = {
  Low: "bg-green-500/60 hover:bg-green-500",
  Moderate: "bg-yellow-500/60 hover:bg-yellow-500",
  High: "bg-orange-500/60 hover:bg-orange-500",
  "Very High": "bg-red-500/60 hover:bg-red-500",
};

const CHART_COLORS = {
  "1": "hsl(var(--chart-1))",
  "2": "hsl(var(--chart-2))",
  "3": "hsl(var(--chart-3))",
  "4": "hsl(var(--chart-4))",
  "5": "hsl(var(--chart-5))",
};

type ChartDataType = "simulatedCases" | "caseRate";
type ChartType = "bar" | "line" | "area" | "pie" | "radial";

const StateHeatMapGrid = ({
  stateName,
  highlightedDistrict,
  highlightedIntensity,
}: {
  stateName: string;
  highlightedDistrict: string;
  highlightedIntensity: string;
}) => {
  const { t } = useTranslation();
  const allDistricts =
    indianStates.find((s) => s.name === stateName)?.districts || [];

  const getIntensity = (district: string) => {
    if (district === highlightedDistrict) return highlightedIntensity;
    const intensities = ["Low", "Moderate", "High", "Very High"];
    return intensities[Math.floor(Math.random() * intensities.length)];
  };

  return (
    <TooltipProvider>
      <div>
        <h4 className="font-semibold mb-2">{stateName}</h4>
        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1 p-2 bg-secondary rounded-lg">
          {allDistricts.map((district) => {
            const intensity = getIntensity(district);
            return (
              <Tooltip key={district}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "h-8 w-full rounded transition-colors",
                      intensityHeatMapStyles[intensity] || "bg-muted",
                      district === highlightedDistrict &&
                        "ring-2 ring-primary-foreground ring-offset-2 ring-offset-background"
                    )}
                  ></div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {district}: {t(intensity.toLowerCase())}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};


const HeatMap = ({ data }: { data: SimulateMalariaRatesOutput | null }) => {
  if (!data) return null;
  const { simulation, comparisonRegion } = data;

  return (
    <div className="space-y-6">
      {simulation && (
        <StateHeatMapGrid
          stateName={simulation.state}
          highlightedDistrict={simulation.district}
          highlightedIntensity={simulation.year1.intensity}
        />
      )}
      {comparisonRegion && (
        <StateHeatMapGrid
          stateName={comparisonRegion.state}
          highlightedDistrict={comparisonRegion.district}
          highlightedIntensity={comparisonRegion.year1.intensity}
        />
      )}
    </div>
  );
};

export default function MalariaMapPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Primary region selections
  const [state1, setState1] = useState<string>("");
  const [district1, setDistrict1] = useState<string>("");

  // Comparison selections
  const [compareRegion, setCompareRegion] = useState(false);
  const [compareYear, setCompareYear] = useState(false);

  const [state2, setState2] = useState<string>("");
  const [district2, setDistrict2] = useState<string>("");

  // Year selections
  const [year1, setYear1] = useState<string>(availableYears[1]);
  const [year2, setYear2] = useState<string>(availableYears[0]);

  const [simulationData, setSimulationData] =
    useState<SimulateMalariaRatesOutput | null>(null);
  const [chartDataType, setChartDataType] =
    useState<ChartDataType>("simulatedCases");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const districts1 = useMemo(() => {
    const selected = indianStates.find((s) => s.name === state1);
    return selected ? selected.districts : [];
  }, [state1]);

  const districts2 = useMemo(() => {
    const selected = indianStates.find((s) => s.name === state2);
    return selected ? selected.districts : [];
  }, [state2]);

  const handleYear1Change = (value: string) => {
    setYear1(value);
    if (value === "Overall") {
      setCompareYear(false);
    }
  };

  const { chartData, chartConfig, lineChartKeys } = useMemo(() => {
    if (!simulationData) return { chartData: [], chartConfig: {}, lineChartKeys: [] };

    const { simulation, comparisonRegion } = simulationData;
    let data: any[] = [];
    const config: ChartConfig = {};
    let keys: string[] = [];

    const isComparingYears = simulation.year2 && !comparisonRegion;
    const isComparingRegions = comparisonRegion;

    if (chartType === 'line' || chartType === 'area') {
      if (isComparingRegions) {
        // Comparing two regions, x-axis is year
        keys = [simulation.district, comparisonRegion.district];
        const years = [simulation.year1.year, simulation.year2?.year, comparisonRegion.year1?.year, comparisonRegion.year2?.year].filter(Boolean) as number[];
        const uniqueYears = [...new Set(years)].sort();

        const yearData: { [year: number]: any } = {};
        uniqueYears.forEach(year => {
          yearData[year] = { name: String(year) };
        });

        const processRegion = (region: typeof simulation | typeof comparisonRegion) => {
          if (!region) return;
          if (region.year1) {
            yearData[region.year1.year][region.district] = region.year1[chartDataType];
          }
          if (region.year2) {
            yearData[region.year2.year][region.district] = region.year2[chartDataType];
          }
        };

        processRegion(simulation);
        processRegion(comparisonRegion);

        data = Object.values(yearData).sort((a, b) => a.name.localeCompare(b.name));
        config[simulation.district] = { label: simulation.district, color: CHART_COLORS[1] };
        config[comparisonRegion.district] = { label: comparisonRegion.district, color: CHART_COLORS[2] };

      } else { // Comparing two years for the same region
        keys = [chartDataType];
        data = [simulation.year1, simulation.year2].filter(Boolean).map(d => ({
          name: String(d!.year),
          [chartDataType]: d![chartDataType]
        })).sort((a, b) => a.name.localeCompare(b.name));
        config[chartDataType] = { label: chartDataType === 'simulatedCases' ? t('simulatedCases') : t('caseRate'), color: CHART_COLORS[1] };
      }
    } else {
      // Logic for bar, pie, radial charts
      const points: { label: string, value: number, color: keyof typeof CHART_COLORS }[] = [];
      if (simulation.year1) points.push({ label: `${simulation.district} ${simulation.year1.year}`, value: simulation.year1[chartDataType], color: '1' });
      if (simulation.year2) points.push({ label: `${simulation.district} ${simulation.year2.year}`, value: simulation.year2[chartDataType], color: '2' });
      if (comparisonRegion?.year1) points.push({ label: `${comparisonRegion.district} ${comparisonRegion.year1.year}`, value: comparisonRegion.year1[chartDataType], color: '3' });
      if (comparisonRegion?.year2) points.push({ label: `${comparisonRegion.district} ${comparisonRegion.year2.year}`, value: comparisonRegion.year2[chartDataType], color: '4' });

      data = points.map(p => {
        const safeLabel = p.label.replace(/[^a-zA-Z0-9]/g, '');
        config[safeLabel] = { label: p.label, color: `hsl(var(--chart-${p.color}))` };
        return { name: p.label, value: p.value, fill: `var(--color-${safeLabel})` };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }

    return { chartData: data, chartConfig: config, lineChartKeys: keys };
  }, [simulationData, chartDataType, chartType, t]);

  const handleRunSimulation = () => {
    if (!state1 || !district1 || !year1) {
      toast({
        variant: "destructive",
        title: t("incompleteSelection"),
        description: t("incompleteSelectionDesc"),
      });
      return;
    }
  
    const isComparingRegions = compareRegion && state2 && district2;
  
    if (compareRegion && (!state2 || !district2)) {
      toast({
        variant: "destructive",
        title: t("incompleteComparison"),
        description: t("incompleteComparisonDesc"),
      });
      return;
    }
  
    startTransition(async () => {
      setSimulationData(null);
      try {
        const languageMap = {
          en: "English",
          hi: "Hindi",
          kn: "Kannada",
        };
  
        const result = await simulateMalariaRates({
          state: state1,
          district: district1,
          year1: parseInt(year1),
          year2: compareYear && year1 !== 'Overall' ? parseInt(year2) : undefined,
          compareState: isComparingRegions ? state2 : undefined,
          compareDistrict: isComparingRegions ? district2 : undefined,
          language: languageMap[language],
        });
        setSimulationData(result);
      } catch (error) {
        console.error("Error running simulation:", error);
        toast({
          variant: "destructive",
          title: t("simulationFailed"),
          description: t("simulationFailedDesc"),
        });
      }
    });
  };

  const renderDataCard = (
    title: string,
    data:
      | SimulateMalariaRatesOutput["simulation"]
      | SimulateMalariaRatesOutput["comparisonRegion"],
    icon: React.ReactNode
  ) => {
    if (!data) return null;

    const year1Data = data.year1;
    const year2Data = data.year2;

    return (
      <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              {icon} {title}
            </CardTitle>
            <Badge variant="outline" className="bg-secondary">
              {data.district}, {data.state}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {year1Data && (
            <div className="p-3 rounded-lg bg-secondary/50">
              <h4 className="font-semibold text-lg">{year1Data.year}</h4>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <p>
                  {t("simulatedCases")}:{" "}
                  <span className="font-bold">
                    {year1Data.simulatedCases.toLocaleString()}
                  </span>
                </p>
                <p>
                  {t("caseRate")}:{" "}
                  <span className="font-bold">
                    {year1Data.caseRate.toFixed(2)}
                  </span>
                </p>
                <p>{t("intensity")}:</p>
                <div
                  className={cn(
                    "rounded-md px-2 py-1 text-center font-medium",
                    intensityStyles[year1Data.intensity]
                  )}
                >
                  {t(year1Data.intensity.toLowerCase())}
                </div>
              </div>
            </div>
          )}
          {year2Data && (
            <>
              <div className="p-3 rounded-lg bg-secondary/50">
                <h4 className="font-semibold text-lg">{year2Data.year}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <p>
                    {t("simulatedCases")}:{" "}
                    <span className="font-bold">
                      {year2Data.simulatedCases.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    {t("caseRate")}:{" "}
                    <span className="font-bold">
                      {year2Data.caseRate.toFixed(2)}
                    </span>
                  </p>
                  <p>{t("intensity")}:</p>
                  <div
                    className={cn(
                      "rounded-md px-2 py-1 text-center font-medium",
                      intensityStyles[year2Data.intensity]
                    )}
                  >
                    {t(year2Data.intensity.toLowerCase())}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ChartContainer config={chartConfig} className="min-h-[450px] w-full">
        {(() => {
          switch (chartType) {
            case 'bar':
              return (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-45} textAnchor="end" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name={chartDataType === 'caseRate' ? t('caseRate') : t('simulatedCases')} radius={8}>
                      {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill as string} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            case 'line':
              return (
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {lineChartKeys.map((key, index) => (
                      <Line key={key} type="monotone" dataKey={key} name={key} stroke={CHART_COLORS[(index + 1) as keyof typeof CHART_COLORS]} strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              );
            case 'area':
              return (
                <ResponsiveContainer width="100%" height={450}>
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {lineChartKeys.map((key, index) => (
                      <Area key={key} type="monotone" dataKey={key} name={key} stackId="1" stroke={CHART_COLORS[(index + 1) as keyof typeof CHART_COLORS]} fill={CHART_COLORS[(index + 1) as keyof typeof CHART_COLORS]} fillOpacity={0.4} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              );
            case 'pie':
              return (
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                      {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill as string} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              );
            case 'radial':
              return (
                <ResponsiveContainer width="100%" height={450}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={chartData}>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <RadialBar minAngle={15} background dataKey="value">
                      {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill as string} />)}
                    </RadialBar>
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  </RadialBarChart>
                </ResponsiveContainer>
              );
            default:
              return null;
          }
        })()}
      </ChartContainer>
    );
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <Map className="h-10 w-10 text-primary" />
        <PageTitle>{t("malariaMap")}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        {t("malariaMapSubtitle")}
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Droplets />
            {t("simulationControls")}
          </CardTitle>
          <CardDescription>{t("simulationControlsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Primary Region */}
            <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
              <h3 className="font-semibold flex items-center gap-2">
                <LocateFixed size={18} />
                {t("primaryRegion")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={state1}
                  onValueChange={(value) => {
                    setState1(value);
                    setDistrict1("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={district1}
                  onValueChange={setDistrict1}
                  disabled={!state1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDistrict")} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts1.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays size={16} /> {t("year1")}
                  </label>
                  <Select value={year1} onValueChange={handleYear1Change}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectYear")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Overall">{t("overallTenYear")}</SelectItem>
                      {availableYears.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {year1 !== "Overall" && (
                  <Button
                    variant={compareYear ? "secondary" : "outline"}
                    onClick={() => setCompareYear(!compareYear)}
                  >
                    <PlusCircle className="mr-2" />
                    {compareYear ? t("removeYear") : t("addYear")}
                  </Button>
                )}
              </div>
              {compareYear && year1 !== "Overall" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays size={16} /> {t("year2")}
                  </label>
                  <Select value={year2} onValueChange={setYear2}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectYear")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Comparison Region */}
            <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <GitCompare size={18} /> {t("comparisonRegion")}
                </h3>
                <Button
                  variant={compareRegion ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCompareRegion(!compareRegion)}
                >
                  {compareRegion ? t("disable") : t("enable")}
                </Button>
              </div>
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 transition-opacity",
                  compareRegion
                    ? "opacity-100"
                    : "opacity-50 pointer-events-none"
                )}
              >
                <Select
                  value={state2}
                  onValueChange={(value) => {
                    setState2(value);
                    setDistrict2("");
                  }}
                  disabled={!compareRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("compareState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={district2}
                  onValueChange={setDistrict2}
                  disabled={!state2 || !compareRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("compareDistrict")} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts2.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleRunSimulation}
              disabled={isPending}
              className="w-full md:w-auto text-lg py-6"
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Microscope />
              )}
              {t("runSimulation")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPending && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>{t("generatingSimulation")}</p>
        </div>
      )}

      {simulationData && (
        <div className="mt-8 space-y-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{t("disclaimer")}</AlertTitle>
            <AlertDescription>{simulationData.disclaimer}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderDataCard(
              t("primaryRegion"),
              simulationData.simulation,
              <LocateFixed />
            )}
            {simulationData.comparisonRegion &&
              renderDataCard(
                t("comparisonRegion"),
                simulationData.comparisonRegion,
                <GitCompare />
              )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    {t("visualComparison")}
                  </CardTitle>
                  <CardDescription>
                    {t("visualComparisonDesc")}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select
                    value={chartDataType}
                    onValueChange={(value) =>
                      setChartDataType(value as ChartDataType)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder={t("selectDataType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulatedCases">
                        {t("simulatedCases")}
                      </SelectItem>
                      <SelectItem value="caseRate">{t("caseRate")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={chartType}
                    onValueChange={(value) => setChartType(value as ChartType)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder={t("selectChartType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">{t("barChart")}</SelectItem>
                      <SelectItem value="line">{t("lineChart")}</SelectItem>
                      <SelectItem value="area">{t("areaChart")}</SelectItem>
                      <SelectItem value="pie">{t("pieChart")}</SelectItem>
                      <SelectItem value="radial">
                        {t("radialBarChart")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderChart()}</CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  {t("comparativeAnalysis")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {simulationData.comparison.analysis}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-green-400" />
                  {t("preventionTip")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {simulationData.comparison.healthTip}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Bug className="h-6 w-6" />
                {t("simulatedHeatMap")}
              </CardTitle>
              <CardDescription>{t("simulatedHeatMapDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatMap data={simulationData} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

    