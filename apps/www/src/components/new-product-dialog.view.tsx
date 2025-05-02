"use client";

import React from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { getSubpartLogUrl, urlHandler } from "@/utils/utils";
import { PreferenceContext } from "@/components/preference-context.view";
import {
    MaterialFormValueType,
    ProductSustainabilityMetricInputType,
    ProductType,
    SubpartType,
} from "@/components/types/product.api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricType } from "@/components/types/metric.api";
import MaterialCard from "@/components/material-card.view";

export default function NewProductDialog(props: { onCreateProduct(): void }) {
    const { theme, companyName } = React.useContext(PreferenceContext);
    const [productInfo, setProductInfo] = React.useState<ProductType>({
        id: "",
        slug: "",
        name: "",
        manufacturer: {
            name: companyName,
            mainURL: "",
        },
        sustainability_metrics_input: [],
        number_of_units: 0,
    });
    const [showDialog, setShowDialog] = React.useState(false);
    const [materialList, setMaterialList] = React.useState<SubpartType[]>([]);
    const [materialFormValues, setMaterialFormValues] =
        React.useState<MaterialFormValueType>({
            productURL: "",
            quantity_needed_per_unit: 0,
        });
    const [metricList, setMetricList] = React.useState<MetricType[]>([
        {
            metric_id: "1",
            name: "CO2",
            unit: "tons",
            description: "GHG Emission",
        },
    ]);

    const handleCreateButtonClick = React.useCallback(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            fetch(urlHandler("/api/products/"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: productInfo.name,
                    manufacturer:
                        productInfo.manufacturer.name === ""
                            ? { name: "test inc" }
                            : {
                                  name: productInfo.manufacturer.name,
                                  mainURL: origin,
                              },
                    sustainability_metrics_input:
                        productInfo.sustainability_metrics_input,
                    number_of_units: productInfo.number_of_units,
                    subparts: materialList
                        ? materialList.map((material) => {
                              return {
                                  name: material.name,
                                  sustainability_metrics_input:
                                      material.sustainability_metrics_input,
                                  quantity_needed_per_unit:
                                      material.quantity_needed_per_unit,
                                  units_bought: material.units_bought,
                                  manufacturer: {
                                      name: material.manufacturer.name,
                                      mainURL: material.manufacturer.mainURL,
                                  },
                                  slug: material.slug,
                              };
                          })
                        : [],
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    materialList?.forEach((material) => {
                        fetch(material.productURL + "/", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                //should have modifier info to save to logs
                                number_of_units:
                                    material.number_of_units -
                                    material.units_bought,
                            }),
                        });

                        fetch(
                            urlHandler(`/api/logs/?product_id=${data.slug}&subpart_id=${material.slug}`)
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                delete data[0].transaction_log_id;
                                fetch(
                                    getSubpartLogUrl(
                                        material.manufacturer.mainURL
                                    ),
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(data[0]),
                                    }
                                );
                            });
                    });
                })
                .then(() => setShowDialog(false))
                .then(() => {
                    const currentDateTime = new Date().toLocaleString("en-US", {
                        weekday: "long", // "Monday" to "Sunday"
                        year: "numeric", // "2023"
                        month: "long", // "January" to "December"
                        day: "numeric", // "1" to "31"
                        hour: "numeric", // "1" to "12" AM/PM
                        minute: "numeric", // "00" to "59"
                        hour12: true, // Use 12-hour format
                    });
                    toast("Product has been created successfully.", {
                        description: currentDateTime,
                    });
                })
                .then(() => props.onCreateProduct());
        }
    }, [productInfo, materialList, props]);

    const handleAddMaterialButtonClick = React.useCallback(() => {
        if (materialFormValues.productURL !== "") {
            fetch(materialFormValues.productURL + "/", {
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => res.json())
                .then((data: ProductType) => {
                    if (data) {
                        delete data.manufacturer.id;
                        let supartMetricInputs: ProductSustainabilityMetricInputType[] =
                            [];
                        if (data.sustainability_metrics) {
                            supartMetricInputs = data.sustainability_metrics
                                .filter((supartMetric) => {
                                    return !!metricList.find(
                                        (metric) =>
                                            metric.name === supartMetric.name
                                    );
                                })
                                .map((supartMetric) => {
                                    return {
                                        metric_id: metricList.find(
                                            (metric) =>
                                                metric.name ===
                                                supartMetric.name
                                        )?.metric_id,
                                        value: supartMetric.value,
                                    };
                                });
                        }
                        if (materialList) {
                            setMaterialList([
                                ...materialList,
                                {
                                    ...data,
                                    sustainability_metrics_input:
                                        supartMetricInputs,
                                    quantity_needed_per_unit:
                                        materialFormValues.quantity_needed_per_unit,
                                    units_bought:
                                        materialFormValues.quantity_needed_per_unit *
                                        productInfo.number_of_units,
                                    productURL: materialFormValues.productURL,
                                },
                            ]);
                        } else {
                            setMaterialList([
                                {
                                    ...data,
                                    sustainability_metrics_input:
                                        supartMetricInputs,
                                    quantity_needed_per_unit:
                                        materialFormValues.quantity_needed_per_unit,
                                    units_bought:
                                        materialFormValues.quantity_needed_per_unit *
                                        productInfo.number_of_units,
                                    productURL: materialFormValues.productURL,
                                },
                            ]);
                        }
                    }
                })
                .then(() =>
                    setMaterialFormValues({
                        productURL: "",
                        quantity_needed_per_unit: 0,
                    })
                );
        }
    }, [materialList, productInfo, materialFormValues, metricList]);

    const handleMaterialDelete = React.useCallback(
        (id: string) => {
            if (confirm("Do you want to remove this material?")) {
                const index = materialList.findIndex((item) => item.id === id);
                if (index > -1) {
                    setMaterialList(materialList.toSpliced(index, 1));
                }
            }
        },
        [materialList, setMaterialList]
    );

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            fetch(urlHandler(`/api/sustainability-metrics/`))
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        setMetricList(data);
                    }
                });
        }
    }, [setMetricList]);

    return (
        <>
            <Dialog
                open={showDialog}
                onOpenChange={(open: boolean) => {
                    setShowDialog(open);
                    setMaterialList([]);
                    setProductInfo({
                        id: "",
                        slug: "",
                        name: "",
                        manufacturer: { name: companyName, mainURL: "" },
                        sustainability_metrics_input: [],
                        number_of_units: 0,
                    });
                    setMaterialFormValues({
                        productURL: "",
                        quantity_needed_per_unit: 0,
                    });
                }}
            >
                <DialogTrigger asChild>
                    <Button onClick={() => setShowDialog(true)}>
                        <PlusIcon className="mr-2 h-4 w-4 text-primary-foreground" />{" "}
                        New product...
                    </Button>
                </DialogTrigger>
                <DialogContent className={`theme-${theme}`}>
                    <DialogHeader>
                        <DialogTitle>Create new product</DialogTitle>
                        <DialogDescription>
                            <p>
                                Add products information here. Click create when
                                you are done.
                            </p>
                            <p>
                                Fields with red asterisk ({" "}
                                <span className={"text-red-500"}>*</span> ) are
                                required.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[75vh] overflow-auto">
                        <div className="grid grid-cols-12 items-center gap-4">
                            <Label htmlFor="name" className="col-span-2">
                                Name <span className={"text-red-500"}>*</span>
                            </Label>
                            <Input
                                id="name"
                                className="col-span-9"
                                placeholder="Example: Steel"
                                onChange={(event) => {
                                    setProductInfo({
                                        ...productInfo,
                                        name: event.target.value,
                                    });
                                }}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                            <Label
                                htmlFor="number-of-units"
                                className="col-span-2"
                            >
                                Number of units{" "}
                                <span className={"text-red-500"}>*</span>
                            </Label>
                            <Input
                                id="number-of-units"
                                placeholder="Example: 20"
                                className="col-span-9"
                                type="number"
                                onChange={(event) => {
                                    setProductInfo({
                                        ...productInfo,
                                        number_of_units: Number.isNaN(
                                            parseInt(event.target.value)
                                        )
                                            ? 0
                                            : parseInt(event.target.value),
                                    });
                                }}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4 mt-4">
                            <Label
                                htmlFor="co2-per-unit"
                                className="col-span-2 border-2 p-2 border-dashed border-primary/30 rounded-md"
                            >
                                Sustainability metrics per unit{" "}
                            </Label>
                            <a className="col-span-10 bg-primary/20 w-full h-[2px]">
                                {" "}
                            </a>
                        </div>
                        {metricList.length > 0 &&
                            metricList.map((metric, index) => {
                                return (
                                    <div
                                        className="grid grid-cols-12 items-center gap-4"
                                        key={index}
                                    >
                                        <Label
                                            htmlFor={`${metric.name}-per-unit`}
                                            className="col-span-2"
                                        >
                                            {metric.name} {`(${metric.unit})`}{" "}
                                        </Label>
                                        <Input
                                            id={`${metric.name}-per-unit`}
                                            placeholder="Example: 20"
                                            className="col-span-9"
                                            type="number"
                                            onChange={(event) => {
                                                let metrics =
                                                    productInfo.sustainability_metrics_input;
                                                const metricIndex =
                                                    metrics?.findIndex(
                                                        (metricInList) =>
                                                            metricInList.metric_id ===
                                                            metric.metric_id
                                                    );
                                                if (
                                                    metrics &&
                                                    metricIndex !== undefined &&
                                                    metricIndex > -1
                                                ) {
                                                    metrics[metricIndex].value =
                                                        parseInt(
                                                            event.target.value
                                                        );
                                                } else if (metric.metric_id) {
                                                    if (metrics) {
                                                        metrics.push({
                                                            metric_id:
                                                                metric.metric_id,
                                                            value: parseInt(
                                                                event.target
                                                                    .value
                                                            ),
                                                        });
                                                    } else {
                                                        metrics = [
                                                            {
                                                                metric_id:
                                                                    metric.metric_id,
                                                                value: parseInt(
                                                                    event.target
                                                                        .value
                                                                ),
                                                            },
                                                        ];
                                                    }
                                                }
                                                setProductInfo({
                                                    ...productInfo,
                                                    sustainability_metrics_input:
                                                        metrics,
                                                });
                                            }}
                                            required
                                        />
                                    </div>
                                );
                            })}
                        <div className="grid grid-cols-12 items-center gap-4 mt-2">
                            <Label className="co2-per-unit col-span-2 border-2 p-2 border-dashed border-primary/30 rounded-md">
                                Materials used
                            </Label>
                            <a className="col-span-10 bg-primary/20 w-full h-[2px]">
                                {" "}
                            </a>
                        </div>
                        <div className="grid grid-cols-10 items-center gap-4 ml-1">
                            <Input
                                id="units-per-product"
                                placeholder="Units used per product. E.g: 20"
                                className="col-span-3"
                                type="number"
                                min="0"
                                onChange={(event) => {
                                    const parsedValue = parseInt(
                                        event.target.value
                                    );
                                    setMaterialFormValues({
                                        ...materialFormValues,
                                        quantity_needed_per_unit:
                                            Number.isNaN(parsedValue) ||
                                            parsedValue < 0
                                                ? 0
                                                : parsedValue,
                                    });
                                }}
                                value={
                                    materialFormValues.quantity_needed_per_unit ===
                                    0
                                        ? ""
                                        : materialFormValues.quantity_needed_per_unit
                                }
                            />
                            <Input
                                id="co2-per-unit"
                                placeholder="Product's API. E.g: https://example.api.com/products/1"
                                className="col-span-3"
                                onChange={(event) => {
                                    setMaterialFormValues({
                                        ...materialFormValues,
                                        productURL: event.target.value,
                                    });
                                }}
                                value={materialFormValues.productURL}
                            />
                            {materialFormValues.quantity_needed_per_unit !==
                                0 &&
                            productInfo.number_of_units !== 0 &&
                            materialFormValues.productURL !== "" ? (
                                <Button
                                    className="col-span-1"
                                    onClick={handleAddMaterialButtonClick}
                                >
                                    Add material
                                </Button>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                className="col-span-1"
                                                disabled={true}
                                            >
                                                Add material
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Please set the amount of products
                                            and amount of materials used by the
                                            product!
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        {materialList.length === 0 ? (
                            <div className="w-full border-4 border-primary/30 border-dashed p-4 text-center text-primary/50 rounded-xl">
                                No material.
                            </div>
                        ) : (
                            <div className="relative h-[380px]">
                                <div className="flex absolute w-full overflow-x-auto">
                                    {materialList.map((material, index) => (
                                        <MaterialCard
                                            {...material}
                                            key={index}
                                            onCardDelete={handleMaterialDelete}
                                            first={index === 0}
                                            last={
                                                index ===
                                                materialList.length - 1
                                            }
                                            two={materialList.length === 2}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {productInfo.name !== "" &&
                        productInfo.number_of_units !== 0 ? (
                            <Button
                                type="submit"
                                onClick={handleCreateButtonClick}
                            >
                                Create
                            </Button>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button type="submit" disabled>
                                            Create
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Please fill all the required information
                                        before creating the product!
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
