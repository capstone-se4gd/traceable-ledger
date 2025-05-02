"use client";
import * as React from "react";
import { imagesUrlHandler, urlHandler } from "@/utils/utils";
import { ProductType } from "@/components/types/product.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MaterialCard from "@/components/material-card.view";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import {
    LogDataTable,
    logDataTableColumns,
} from "@/components/log-data-table.view";
import { LogType } from "@/components/types/log.api";

export default function Page({ params }: { params: { productId: string } }) {
    const [productInfo, setProductInfo] = React.useState<ProductType>({
        id: "1",
        slug: "abc",
        subparts: [
            {
                id: "1ALWODJHQWOIDSALFKNDFlsdkfncv",
                slug: "abcdsd",
                manufacturer: {
                    id: 2,
                    name: "Greenergy Oy",
                    mainURL: "http://0.0.0.0",
                },
                name: "Green Electricity",
                sustainability_metrics: [
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                    {
                        name: "CO2",
                        value: 20,
                        description: "GHG Emission",
                        unit: "tons",
                    },
                ],
                quantity_needed_per_unit: 2,
                units_bought: 200,
                number_of_units: 300,
                productURL: "",
            },
        ],
        manufacturer: {
            id: 1,
            name: "Miningful Oyj",
            mainURL: "http://0.0.0.0",
        },
        name: "Steel",
        number_of_units: 100,
        sustainability_metrics: [
            {
                name: "CO2",
                value: 69,
                description: "GHG Emission",
                unit: "tons",
            },
        ],
    });
    const [imageUrl, setImageUrl] = React.useState("");
    const [logsData, setLogsData] = React.useState<LogType[]>([]);

    const fetchData = React.useCallback(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            fetch(urlHandler(`/api/products/${params.productId}/`))
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        setProductInfo(data);
                        fetch(imagesUrlHandler(), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                productName: String(data.name),
                            }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                if (data) {
                                    setImageUrl(data.imageUrl);
                                }
                            });
                    }
                });
        }
    }, [setProductInfo, params.productId]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            fetch(
                urlHandler(`/api/logs/?subpart_id=${params.productId}`)
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        if (Array.isArray(data)) setLogsData(data);
                    }
                });
        }
    }, [params.productId]);

    return (
        <>
            <Card className="w-[80vw] min-w-[600px] m-auto">
                <CardHeader className="flex-row items-center pb-0 justify-between">
                    <CardTitle className="flex">{productInfo.name}</CardTitle>
                    <Button
                        className="mt-0 gap-2"
                        variant="secondary"
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                window.print();
                            }
                        }}
                    >
                        Print <PrinterIcon width={16} height={16} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div>
                        {imageUrl === "" || imageUrl === "null" ? (
                            <Skeleton className="h-[300px] w-full rounded-xl my-8" />
                        ) : (
                            <img
                                alt="product-image"
                                src={imageUrl}
                                className="h-[300px] w-full rounded-xl my-8 object-contain"
                            />
                        )}
                        <p className="mb-2">
                            <span className="font-semibold">
                                Number of Units:{" "}
                            </span>{" "}
                            <a>{productInfo.number_of_units}</a>
                        </p>
                        {productInfo.sustainability_metrics?.map(
                            (metric, index) => {
                                return (
                                    <p className="mb-2" key={index}>
                                        <span className="font-semibold">
                                            {metric.name} per Unit (
                                            {metric.unit}
                                            ):
                                        </span>{" "}
                                        <a>{metric.value}</a>
                                    </p>
                                );
                            }
                        )}
                        <p className="mb-2">
                            <span className="font-semibold">
                                Materials used:{" "}
                            </span>
                            {!productInfo.subparts ||
                                (productInfo.subparts.length === 0 && (
                                    <span className="italic text-zinc-400">
                                        -No material used-
                                    </span>
                                ))}
                        </p>
                        {productInfo.subparts &&
                            productInfo.subparts.length > 0 && (
                                <div className="relative">
                                    <div className="flex absolute w-full overflow-x-auto">
                                        {productInfo.subparts.map(
                                            (material, index) => (
                                                <MaterialCard
                                                    key={index}
                                                    {...material}
                                                    first={index === 0}
                                                    last={
                                                        productInfo.subparts &&
                                                        index ===
                                                            productInfo.subparts
                                                                .length -
                                                                1
                                                    }
                                                    two={
                                                        productInfo.subparts
                                                            ?.length === 2
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        <p
                            className={`mb-2 ${
                                productInfo.subparts &&
                                productInfo.subparts.length > 0
                                    ? "mt-[510px]"
                                    : ""
                            } flex`}
                        >
                            <span className="font-semibold">
                                Transaction logs:
                            </span>
                        </p>
                        <LogDataTable
                            columns={logDataTableColumns()}
                            data={logsData}
                        />
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
