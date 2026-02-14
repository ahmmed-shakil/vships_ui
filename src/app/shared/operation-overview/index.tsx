"use client";
import WidgetCard from "@/components/cards/widget-card";
import DateFiled from "@/components/controlled-table/date-field";
import { shipData } from "@/data/nura/ships";
import { useState } from "react";
import { Select } from "rizzui/select";
import MinimalTable from "../tables/basic/minimal";
import GoogleMap from "@/components/google-map";
import BasicTable from "../tables/basic";
import FleetStatus from "../logistics/dashboard/fleet-status";
import ActivityReport from "../file/dashboard/activity-report";
import SimpleBarChart from "../chart-widgets/simple-bar-chart";

export default function OperationOverviewLayout() {
    const [selectedShip, setSelectedShip] = useState(shipData[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString());
    return (
        <>
            <div className="flex justify-center gap-4 mx-40 mb-4">
                <Select options={shipData} value={selectedShip} onChange={setSelectedShip} className="w-1/4" />
                <DateFiled value={selectedDate} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>

                    <WidgetCard title={'Machinery Stats'} className="space-y-4 col-span-2">
                        <BasicTable />
                    </WidgetCard>
                </div>
                <div className="col-span-2">
                    <GoogleMap />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-10">
                <WidgetCard title={'speed'} className="space-y-4">
                    <BasicTable />
                </WidgetCard>
                <FleetStatus className="" />
                <FleetStatus className="" />
                <FleetStatus className="" />
            </div>
            <ActivityReport />
            <ActivityReport />
            <ActivityReport />
            <div className="grid grid-cols-4 gap-4">
                <SimpleBarChart />
                <SimpleBarChart />
                <div className="col-span-2"><SimpleBarChart /></div>

            </div>
        </>
    );
}