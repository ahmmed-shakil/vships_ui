"use client"

import WidgetCard from "@/components/cards/widget-card";
import DateFiled from "@/components/controlled-table/date-field";
import { shipData } from "@/data/nura/ships";
import { useState } from "react";
import { Select } from "rizzui/select";
import ActivityReport from "../../file/dashboard/activity-report";
import BasicTable from "../../tables/basic";

export default function ConditionMonitoringLayout() {
    const [selectedShip, setSelectedShip] = useState(shipData[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString());
    return (
        <>
            <div className="flex justify-center gap-4 mx-40 mb-4">
                <Select options={shipData} value={selectedShip} onChange={setSelectedShip} className="w-1/4" />
                <Select options={shipData} value={selectedShip} onChange={setSelectedShip} className="w-1/4" />
                <DateFiled value={selectedDate} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <WidgetCard title={'Machinery Stats'}>
                    <BasicTable />
                </WidgetCard>
                <WidgetCard title={'Machinery Stats'}>
                    <BasicTable />
                </WidgetCard>
            </div>
            <ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport /><ActivityReport />
        </>
    );
}