"use client"

import GoogleMap from "@/components/google-map";
import { engineData, shipData } from "@/data/nura/ships";
import { useState } from "react";
import { Select } from "rizzui/select";

import PledgesNumber from "../bidding/dashboard/pledges-number";
import ProjectSummary from "../project-dashboard/project-summary";

export const AlarmMonitorLayout = () => {
    const [selectedShip, setSelectedShip] = useState<string>(shipData[0].value);
    const [selectedEngine, setSelectedEngine] = useState<string>(engineData[0].value);
    return (
        <>
            {/* ship selects */}
            <div className="flex justify-center gap-4 mx-40">
                <Select options={shipData} value={selectedShip} onChange={setSelectedShip} />
                <Select options={engineData} value={selectedEngine} onChange={setSelectedEngine} />
            </div>

            {/* main grid */}
            <div className='grid grid-cols-4 gap-4 mt-2'>
                <div className='col-span-3'>
                    <div className="grid grid-cols-12 gap-4">
                        <div className='col-span-3'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-3'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-3'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-3'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-2'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-2'>
                            <PledgesNumber />
                        </div>
                        <div className="col-span-4 grid grid-rows-2 gap-4">
                            <PledgesNumber />
                            <PledgesNumber />
                        </div>
                        <div className='col-span-2'>
                            <PledgesNumber />
                        </div>
                        <div className='col-span-2'>
                            <PledgesNumber />
                        </div>
                    </div>
                </div>
                <GoogleMap />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-2">
                <ProjectSummary className="col-span-3" />
                <ProjectSummary className="" />
            </div>
        </>
    );
};