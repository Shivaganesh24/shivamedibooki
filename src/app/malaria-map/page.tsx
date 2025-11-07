
"use client";

import { useState, useMemo, useTransition } from "react";
import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indianStates } from "@/lib/india-data";
import { BarChart as BarChartIcon, Bug, Info, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Loader2, Map, Microscope, ShieldCheck } from "lucide-react";
import { simulateMalariaRates, type SimulateMalariaRatesOutput } from "@/ai/flows/simulate-malaria-rates";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";


const availableYears = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

const intensityStyles: { [key: string]: string } = {
    "Low": "bg-green-500/20 text-green-400 border-green-500/30",
    "Moderate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "High": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Very High": "bg-red-500/20 text-red-400 border-red-500/30",
};

type ChartDataType = 'simulatedCases' | 'caseRate';
type ChartType = 'bar' | 'line' | 'area';

export default function MalariaMapPage() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Primary region selections
    const [state1, setState1] = useState<string>('');
    const [district1, setDistrict1] = useState<string>('');
    
    // Comparison region selections
    const [compare, setCompare] = useState(false);
    const [state2, setState2] = useState<string>('');
    const [district2, setDistrict2] = useState<string>('');
    
    // Year selections
    const [year1, setYear1] = useState<string>(String(availableYears[1]));
    const [year2, setYear2] = useState<string>(String(availableYears[0]));
    
    const [simulationData, setSimulationData] = useState<SimulateMalariaRatesOutput | null>(null);
    const [chartDataType, setChartDataType] = useState<ChartDataType>('simulatedCases');
    const [chartType, setChartType] = useState<ChartType>('bar');


    const districts1 = useMemo(() => {
        const selected = indianStates.find(s => s.name === state1);
        return selected ? selected.districts : [];
    }, [state1]);

    const districts2 = useMemo(() => {
        const selected = indianStates.find(s => s.name === state2);
        return selected ? selected.districts : [];
    }, [state2]);

    const chartData = useMemo(() => {
        if (!simulationData) return [];

        const { simulation, comparisonRegion } = simulationData;
        const data = [];

        if (simulation.year1) {
            data.push({
                name: `${simulation.district} ${simulation.year1.year}`,
                [chartDataType]: simulation.year1[chartDataType],
                fill: 'var(--color-chart-1)'
            });
        }
        if (simulation.year2) {
             data.push({
                name: `${simulation.district} ${simulation.year2.year}`,
                [chartDataType]: simulation.year2[chartDataType],
                fill: 'var(--color-chart-2)'
            });
        }
        if (comparisonRegion?.year1) {
            data.push({
                name: `${comparisonRegion.district} ${comparisonRegion.year1.year}`,
                [chartDataType]: comparisonRegion.year1[chartDataType],
                fill: 'var(--color-chart-3)'
            });
        }
        if (comparisonRegion?.year2) {
             data.push({
                name: `${comparisonRegion.district} ${comparisonRegion.year2.year}`,
                [chartDataType]: comparisonRegion.year2[chartDataType],
                fill: 'var(--color-chart-4)'
            });
        }
        return data.sort((a, b) => a.name.localeCompare(b.name));
    }, [simulationData, chartDataType]);


    const handleRunSimulation = () => {
        if (!state1 || !district1 || !year1) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Selection',
                description: 'Please select a state, district, and at least one year for the primary region.'
            });
            return;
        }

        if (compare && !state2 && !district2 && !year2) {
             toast({
                variant: 'destructive',
                title: 'Incomplete Comparison Selection',
                description: 'Please select a second year or a comparison region to enable comparison.'
            });
            return;
        }

        startTransition(async () => {
            setSimulationData(null);
            try {
                const result = await simulateMalariaRates({
                    state: state1,
                    district: district1,
                    year1: parseInt(year1),
                    year2: compare && year2 ? parseInt(year2) : undefined,
                    compareState: compare && state2 ? state2 : undefined,
                    compareDistrict: compare && district2 ? district2 : undefined,
                });
                setSimulationData(result);
            } catch (error) {
                console.error("Error running simulation:", error);
                toast({
                    variant: "destructive",
                    title: "Simulation Failed",
                    description: "An unexpected error occurred while generating the simulation. Please try again."
                });
            }
        });
    }

    const renderDataCard = (title: string, data: SimulateMalariaRatesOutput['simulation'] | SimulateMalariaRatesOutput['comparisonRegion']) => {
        if (!data) return null;

        const year1Data = data.year1;
        const year2Data = data.year2;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                    <CardDescription>{data.district}, {data.state}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {year1Data && (
                        <div>
                            <h4 className="font-semibold text-lg">{year1Data.year}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <p>Simulated Cases: <span className="font-bold">{year1Data.simulatedCases.toLocaleString()}</span></p>
                                <p>Rate per 1,000: <span className="font-bold">{year1Data.caseRate.toFixed(2)}</span></p>
                                <p>Intensity:</p>
                                <div className={cn("rounded-md px-2 py-1 text-center font-medium", intensityStyles[year1Data.intensity])}>
                                    {year1Data.intensity}
                                </div>
                            </div>
                        </div>
                    )}
                    {year2Data && (
                        <>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-lg">{year2Data.year}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <p>Simulated Cases: <span className="font-bold">{year2Data.simulatedCases.toLocaleString()}</span></p>
                                <p>Rate per 1,000: <span className="font-bold">{year2Data.caseRate.toFixed(2)}</span></p>
                                <p>Intensity:</p>
                                <div className={cn("rounded-md px-2 py-1 text-center font-medium", intensityStyles[year2Data.intensity])}>
                                    {year2Data.intensity}
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
        );
    }
    
    const renderChart = () => {
        const ChartComponent = {
            bar: BarChart,
            line: LineChart,
            area: AreaChart,
        }[chartType];

        const MainComponent = {
            bar: <Bar dataKey={chartDataType} radius={8} />,
            line: <Line type="monotone" dataKey={chartDataType} stroke="hsl(var(--primary))" strokeWidth={2} />,
            area: <Area type="monotone" dataKey={chartDataType} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />,
        }[chartType];

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ChartComponent data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 15)}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {MainComponent}
                </ChartComponent>
            </ResponsiveContainer>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4">
                <Map className="h-10 w-10 text-primary" />
                <PageTitle>AI-Simulated Malaria Map</PageTitle>
            </div>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                Explore and compare simulated malaria case rates across India for educational and awareness purposes.
            </p>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Simulation Controls</CardTitle>
                    <CardDescription>Select regions and years to generate the simulation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Region Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Region */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold">Primary Region</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={state1} onValueChange={value => { setState1(value); setDistrict1(''); }}>
                                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                    <SelectContent>
                                        {indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={district1} onValueChange={setDistrict1} disabled={!state1}>
                                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                    <SelectContent>
                                        {districts1.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Comparison Region */}
                        <div className="space-y-4 p-4 border rounded-lg">
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Comparison</h3>
                                <Button variant={compare ? "secondary" : "outline"} size="sm" onClick={() => setCompare(!compare)}>
                                    {compare ? "Disable" : "Enable"}
                                </Button>
                            </div>
                            <div className={cn("grid grid-cols-2 gap-4 transition-opacity", compare ? "opacity-100" : "opacity-50 pointer-events-none")}>
                                <Select value={state2} onValueChange={value => { setState2(value); setDistrict2(''); }} disabled={!compare}>
                                    <SelectTrigger><SelectValue placeholder="Compare State" /></SelectTrigger>
                                    <SelectContent>
                                        {indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={district2} onValueChange={setDistrict2} disabled={!state2 || !compare}>
                                    <SelectTrigger><SelectValue placeholder="Compare District" /></SelectTrigger>
                                    <SelectContent>
                                        {districts2.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* Year Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                         <div className="space-y-2">
                             <label className="text-sm font-medium">Year 1</label>
                            <Select value={year1} onValueChange={setYear1}>
                                <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                <SelectContent>
                                    {availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={cn("space-y-2 transition-opacity", compare ? "opacity-100" : "opacity-50 pointer-events-none")}>
                             <label className="text-sm font-medium">Year 2 (for comparison)</label>
                            <Select value={year2} onValueChange={setYear2} disabled={!compare}>
                                <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                <SelectContent>
                                    {availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <Button onClick={handleRunSimulation} disabled={isPending} className="w-full md:w-auto">
                            {isPending ? <Loader2 className="animate-spin" /> : <Microscope />}
                            Run Simulation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Simulation Results */}
            {isPending && (
                 <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p>Generating simulation, this may take a moment...</p>
                </div>
            )}

            {simulationData && (
                <div className="mt-8 space-y-8">
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Disclaimer</AlertTitle>
                        <AlertDescription>{simulationData.disclaimer}</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {renderDataCard("Primary Region Simulation", simulationData.simulation)}
                         {simulationData.comparisonRegion && renderDataCard("Comparison Region Simulation", simulationData.comparisonRegion)}
                    </div>
                   
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div >
                                    <CardTitle className="font-headline flex items-center gap-2">
                                        <BarChartIcon className="h-6 w-6" />
                                        Visual Comparison
                                    </CardTitle>
                                    <CardDescription>
                                        A visual representation of the simulated data.
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Select value={chartDataType} onValueChange={(value) => setChartDataType(value as ChartDataType)}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Select data type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simulatedCases">Simulated Cases</SelectItem>
                                        <SelectItem value="caseRate">Case Rate (per 1,000)</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Select chart type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bar">Bar Chart</SelectItem>
                                        <SelectItem value="line">Line Chart</SelectItem>
                                        <SelectItem value="area">Area Chart</SelectItem>
                                    </SelectContent>
                                </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {renderChart()}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <BarChartIcon className="h-6 w-6" />
                                    Comparative Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{simulationData.comparison.analysis}</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <ShieldCheck className="h-6 w-6 text-green-400" />
                                    Prevention Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{simulationData.comparison.healthTip}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placeholder for map visualization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Bug className="h-6 w-6" />
                                Simulated Heat Map
                            </CardTitle>
                             <CardDescription>
                                Visual representation of simulated malaria intensity. Darker colors indicate higher simulated case rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-96 bg-secondary rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Map visualization would be displayed here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

    