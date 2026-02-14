"use client"

import WidgetCard from "@/components/cards/widget-card";
import DateFiled from "@/components/controlled-table/date-field";
import GoogleMap from "@/components/google-map";
import { shipData } from "@/data/nura/ships";
import { useState } from "react";
import { Select } from "rizzui/select";
import ActivityReport from "../file/dashboard/activity-report";
import MinimalTable from "../tables/basic/minimal";
import ModernTable from "../tables/basic/modern";

export const DailyOverviewLayout = () => {
    const [selectedShip, setSelectedShip] = useState(shipData[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString());
    return (
        <>
            <div className="flex justify-center gap-4 mx-40 mb-4">
                <Select options={shipData} value={selectedShip} onChange={setSelectedShip} className="w-1/4" />
                <DateFiled value={selectedDate} />

            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <ActivityReport />
                    <ActivityReport />
                    <ActivityReport />
                </div>
                <GoogleMap />
            </div>
            <div className="grid grid-cols-5 gap-4 mt-10">
                <WidgetCard title="Machinery Stats" className="space-y-4 col-span-3">
                    <ModernTable />
                </WidgetCard>
                <WidgetCard title={'Genset'} className="space-y-4 col-span-2">
                    <MinimalTable />
                </WidgetCard>
            </div>
        </>
    );
};