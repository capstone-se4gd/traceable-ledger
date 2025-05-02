"use client";
import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { MetricType } from "@/components/types/metric.api";
import { urlHandler } from "@/utils/utils";
import { toast } from "sonner";
import {
    MetricDataTable,
    metricDataTableColumns,
} from "@/components/metric-data-table.view";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

export default function MetricsPage() {
    const [newMetricInfo, setNewMetricInfo] = React.useState<MetricType>({
        name: "",
        unit: "",
        description: "",
    });

    const [metricList, setMetricList] = React.useState<MetricType[]>([]);

    const handleClearMetricButtonClick = React.useCallback(() => {
        setNewMetricInfo({ name: "", unit: "", description: "" });
    }, [setNewMetricInfo]);

    const fetchData = React.useCallback(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            fetch(urlHandler("/api/sustainability-metrics/"))
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        setMetricList(data);
                    }
                });
        }
    }, [setMetricList]);

    const handleAddMetricButtonClick = React.useCallback(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            fetch(urlHandler("/api/sustainability-metrics/"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newMetricInfo.name,
                    unit: newMetricInfo.unit,
                    description: newMetricInfo.description,
                }),
            }).then(() => {
                handleClearMetricButtonClick();
                const currentDateTime = new Date().toLocaleString("en-US", {
                    weekday: "long", // "Monday" to "Sunday"
                    year: "numeric", // "2023"
                    month: "long", // "January" to "December"
                    day: "numeric", // "1" to "31"
                    hour: "numeric", // "1" to "12" AM/PM
                    minute: "numeric", // "00" to "59"
                    hour12: true, // Use 12-hour format
                });
                toast("Metric has been created successfully.", {
                    description: currentDateTime,
                });
                fetchData();
            });
        }
    }, [newMetricInfo, handleClearMetricButtonClick, fetchData]);

    const handleUpdateMetricButtonClick = React.useCallback(
        (metric: MetricType) => {
            console.log(metric);
            if (typeof window !== "undefined" && !!metric.metric_id) {
                const origin = window.location.origin;
                fetch(
                    urlHandler(`/api/sustainability-metrics/${metric.metric_id}/`),
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: metric.name,
                            unit: metric.unit,
                            description: metric.description,
                        }),
                    }
                ).then(() => {
                    const currentDateTime = new Date().toLocaleString("en-US", {
                        weekday: "long", // "Monday" to "Sunday"
                        year: "numeric", // "2023"
                        month: "long", // "January" to "December"
                        day: "numeric", // "1" to "31"
                        hour: "numeric", // "1" to "12" AM/PM
                        minute: "numeric", // "00" to "59"
                        hour12: true, // Use 12-hour format
                    });
                    toast("Metric has been updated successfully.", {
                        description: currentDateTime,
                    });
                    fetchData();
                });
            }
        },
        [fetchData]
    );

    const handleDeleteMetricButtonClick = React.useCallback(
        (metricId?: string) => {
            if (typeof window !== "undefined" && !!metricId) {
                const origin = window.location.origin;
                fetch(
                    urlHandler(`/api/sustainability-metrics/${metricId}/`),
                    {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    }
                ).then(() => {
                    const currentDateTime = new Date().toLocaleString("en-US", {
                        weekday: "long", // "Monday" to "Sunday"
                        year: "numeric", // "2023"
                        month: "long", // "January" to "December"
                        day: "numeric", // "1" to "31"
                        hour: "numeric", // "1" to "12" AM/PM
                        minute: "numeric", // "00" to "59"
                        hour12: true, // Use 12-hour format
                    });
                    toast("Metric has been deleted successfully.", {
                        description: currentDateTime,
                    });
                    fetchData();
                });
            }
        },
        [fetchData]
    );

    const EditMetricDialog = (props: { metric: MetricType }) => {
        const { metric } = props;
        const [updateMetricInfo, setUpdateMetricInfo] =
            React.useState<MetricType>({
                name: metric.name ?? "",
                unit: metric?.unit ?? "",
                description: metric?.description ?? "",
            });

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        className="bg-blue-500 hover:bg-blue-700"
                        title="Edit metric"
                    >
                        <Pencil2Icon />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit metric</DialogTitle>
                        <DialogDescription>
                            Make changes to the metric here. Click save when you
                            are done.
                        </DialogDescription>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    className="col-span-3"
                                    placeholder="Example: CO2"
                                    onChange={(event) => {
                                        setUpdateMetricInfo({
                                            ...updateMetricInfo,
                                            name: event.target.value,
                                        });
                                    }}
                                    value={updateMetricInfo.name}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">
                                    Unit
                                </Label>
                                <Input
                                    id="unit"
                                    className="col-span-3"
                                    onChange={(event) => {
                                        setUpdateMetricInfo({
                                            ...updateMetricInfo,
                                            unit: event.target.value,
                                        });
                                    }}
                                    value={updateMetricInfo.unit}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Example: GHG Emissions equivalent"
                                    className="resize-none col-span-3"
                                    onChange={(event) => {
                                        setUpdateMetricInfo({
                                            ...updateMetricInfo,
                                            description: event.target.value,
                                        });
                                    }}
                                    value={updateMetricInfo.description}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant={"ghost"}>Cancel</Button>
                            </DialogClose>
                            {updateMetricInfo.name !== "" &&
                            updateMetricInfo.unit !== "" &&
                            updateMetricInfo.description !== "" ? (
                                <Button
                                    className="col-span-1"
                                    onClick={() =>
                                        handleUpdateMetricButtonClick({
                                            ...updateMetricInfo,
                                            metric_id: metric.metric_id,
                                        })
                                    }
                                >
                                    Update metric
                                </Button>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                className="col-span-1"
                                                disabled={true}
                                            >
                                                Update metric
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Please fill in all required fields!
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    };

    const deleteMetricDialog = React.useCallback(
        (metricId?: string) => {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" title="Delete metric">
                            <TrashIcon />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete metric</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this metric?
                                This metric from all of your product will also
                                be deleted permanently.
                            </DialogDescription>
                            <DialogFooter>
                                <Button
                                    className="col-span-1"
                                    onClick={() =>
                                        handleDeleteMetricButtonClick(metricId)
                                    }
                                >
                                    Delete metric
                                </Button>
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            );
        },
        [handleDeleteMetricButtonClick]
    );

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="flex gap-8 flex-wrap w-[80vw] m-auto">
            <Card className="flex-shrink h-fit">
                <CardHeader>
                    <CardTitle>Create new metric</CardTitle>
                    <CardDescription>
                        Creates a sustainability metric that your company
                        provides via your products
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="">
                            <Label htmlFor="name" className="">
                                Name <span className={"text-red-500"}>*</span>
                            </Label>
                            <Input
                                id="name"
                                className=""
                                placeholder="Example: CO2"
                                onChange={(event) => {
                                    setNewMetricInfo({
                                        ...newMetricInfo,
                                        name: event.target.value,
                                    });
                                }}
                                value={newMetricInfo.name}
                                required
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="unit" className="">
                                Unit <span className={"text-red-500"}>*</span>
                            </Label>
                            <Input
                                id="unit"
                                placeholder="Example: tons"
                                className=""
                                onChange={(event) => {
                                    setNewMetricInfo({
                                        ...newMetricInfo,
                                        unit: event.target.value,
                                    });
                                }}
                                value={newMetricInfo.unit}
                                required
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="description" className="">
                                Description{" "}
                                <span className={"text-red-500"}>*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Example: GHG Emissions equivalent"
                                className="resize-none"
                                onChange={(event) => {
                                    setNewMetricInfo({
                                        ...newMetricInfo,
                                        description: event.target.value,
                                    });
                                }}
                                value={newMetricInfo.description}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4 justify-end">
                    <Button
                        variant={"ghost"}
                        onClick={handleClearMetricButtonClick}
                    >
                        Cancel
                    </Button>
                    {newMetricInfo.name !== "" &&
                    newMetricInfo.unit !== "" &&
                    newMetricInfo.description !== "" ? (
                        <Button
                            className="col-span-1"
                            onClick={handleAddMetricButtonClick}
                        >
                            Add metric
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        className="col-span-1"
                                        disabled={true}
                                    >
                                        Add metric
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Please fill in all required fields!
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </CardFooter>
            </Card>
            <Card className="flex-1 h-fit">
                <CardHeader>
                    <CardTitle>Sustainability Metrics</CardTitle>
                    <CardDescription>
                        A definition list of sustainability metrics that your
                        company provides
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MetricDataTable
                        data={metricList}
                        columns={metricDataTableColumns(
                            EditMetricDialog,
                            deleteMetricDialog
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
