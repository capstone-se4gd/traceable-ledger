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
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Pencil2Icon, CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { getProductUrl, imagesUrlHandler, urlHandler } from "@/utils/utils";
import { ProductCardProps } from "./types/product.api";
import MaterialCard from "@/components/material-card.view";
import { PreferenceContext } from "@/components/preference-context.view";
import { LogType } from "@/components/types/log.api";
import {
    LogDataTable,
    logDataTableColumns,
} from "@/components/log-data-table.view";

export default function ProductCard(props: ProductCardProps) {
    const { theme } = React.useContext(PreferenceContext);
    const [isCopyButtonClicked, setIsCopyButtonClicked] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState("");
    const [logsData, setLogsData] = React.useState<LogType[]>([]);

    const handleCopyUrlButtonClick = React.useCallback(() => {
        setIsCopyButtonClicked(true);
        navigator.clipboard.writeText(getProductUrl(props.id) ?? "");
    }, [props.id]);

    React.useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(imagesUrlHandler(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productName: String(props.title),
                }),
            });
            const data = await response.json();
            setImageUrl(data.imageUrl);
        };
        fetchData();
    }, [setImageUrl, props.title]);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            fetch(
                `${urlHandler("")}/api/logs/?subpart_id=${props.id}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        if (Array.isArray(data)) setLogsData(data);
                    }
                });
        }
    }, [props.id]);

    React.useEffect(() => {
        if (isCopyButtonClicked) {
            const interval = setInterval(() => {
                setIsCopyButtonClicked(false);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [isCopyButtonClicked]);

    return (
        <Card className="w-[320px]">
            <CardHeader>
                <CardTitle>{props.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {imageUrl === "" || imageUrl === "null" ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                ) : (
                    <img
                        alt="product-image"
                        src={imageUrl}
                        className="h-[200px] w-full rounded-xl object-contain"
                    />
                )}
                {typeof props.description == "string" ? (
                    <CardDescription>{props.description}</CardDescription>
                ) : (
                    props.description
                )}
            </CardContent>
            {typeof props.title == "string" && (
                <CardFooter className="flex justify-end">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button>More info</Button>
                        </SheetTrigger>
                        <SheetContent
                            className={`theme-${theme} w-[80vw] sm:w-[80vw] sm:max-w-[80vw]`}
                        >
                            <SheetHeader>
                                <SheetTitle>
                                    Product name: {props.title}
                                </SheetTitle>
                            </SheetHeader>
                            <div
                                style={{ height: "calc(100vh - 120px)" }}
                                className="overflow-auto my-2"
                            >
                                <div>
                                    <div className="flex gap-6">
                                        {imageUrl === "" ||
                                        imageUrl === "null" ? (
                                            <Skeleton className="h-[250px] w-[250px] rounded-xl mt-4 mb-8" />
                                        ) : (
                                            <img
                                                alt="product-image"
                                                src={imageUrl}
                                                className="h-[300px] w-[250px] rounded-xl mt-4 mb-8 object-contain"
                                            />
                                        )}
                                        <div className="mt-4 flex flex-col flex-grow flex-wrap gap-1">
                                            <div className="flex items-center gap-4">
                                                <p>
                                                    <span className="font-semibold">
                                                        Product API URL:
                                                    </span>{" "}
                                                    <a
                                                        href={getProductUrl(
                                                            props.id
                                                        )}
                                                        className={
                                                            "text-blue-400 underline"
                                                        }
                                                    >
                                                        {getProductUrl(
                                                            props.id
                                                        )}
                                                    </a>
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={
                                                        isCopyButtonClicked
                                                            ? "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                                                            : ""
                                                    }
                                                    onClick={
                                                        handleCopyUrlButtonClick
                                                    }
                                                    title={
                                                        isCopyButtonClicked
                                                            ? "Copied"
                                                            : "Copy"
                                                    }
                                                >
                                                    {isCopyButtonClicked ? (
                                                        <CheckIcon />
                                                    ) : (
                                                        <CopyIcon />
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="mb-2">
                                                <span className="font-semibold">
                                                    Number of Units:{" "}
                                                </span>{" "}
                                                <a>{props.numberOfUnits}</a>
                                            </p>
                                            {props.sustainability_metrics?.map(
                                                (metric, index) => {
                                                    return (
                                                        <p
                                                            className="mb-2"
                                                            key={index}
                                                        >
                                                            <span className="font-semibold">
                                                                {metric.name}{" "}
                                                                per Unit (
                                                                {metric.unit}
                                                                ):
                                                            </span>{" "}
                                                            <a>
                                                                {metric.value}
                                                            </a>
                                                        </p>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                    <p className="mb-2 flex">
                                        <span className="font-semibold">
                                            Materials used:
                                        </span>
                                    </p>
                                    {props.subparts &&
                                    props.subparts.length > 0 ? (
                                        <div className="relative">
                                            <div className="flex absolute w-full overflow-x-auto">
                                                {props.subparts.map(
                                                    (material, index) => (
                                                        <MaterialCard
                                                            key={index}
                                                            {...material}
                                                            first={index === 0}
                                                            last={
                                                                props.subparts &&
                                                                index ===
                                                                    props
                                                                        .subparts
                                                                        .length -
                                                                        1
                                                            }
                                                            two={
                                                                props.subparts
                                                                    ?.length ===
                                                                2
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full border-4 mb-8 border-primary/30 border-dashed p-4 text-center text-primary/50 rounded-xl">
                                            No material.
                                        </div>
                                    )}
                                    <p
                                        className={`mb-2 ${
                                            props.subparts &&
                                            props.subparts.length > 0
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
                            </div>
                            <SheetFooter className="mt-2">
                                <Button className="bg-blue-500">
                                    {" "}
                                    <Pencil2Icon className="mr-2 h-4 w-4" />{" "}
                                    Update
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </CardFooter>
            )}
        </Card>
    );
}
