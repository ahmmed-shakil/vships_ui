import cn from "@/utils/class-names";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
    className?: string;
    placeholder?: string;
    dateFormat?: string;
    disabled?: boolean;
    maxDays?: number; // Maximum number of days in range
    startDate?: Date | null;
    endDate?: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    className = "form-control",
    placeholder = "Select date range",
    dateFormat = "dd.MM.yyyy",
    disabled = false,
    maxDays = 30, // Default max 30 days range
    startDate,
    endDate,
    onChange,
}) => {

    const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;

        if (start && end) {
            // Check if range exceeds maxDays
            const daysDiff = Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff <= maxDays) {
                onChange([start, end]);
            } else {
                // Optional: Show user feedback about max range
                console.warn(`Date range cannot exceed ${maxDays} days`);
                // Clear or revert, we just won't update
                onChange([start, null]);
            }
        } else {
            onChange(dates);
        }
    };

    return (
        <div className="w-full">
            <DatePicker
                selected={startDate}
                onChange={handleDateRangeChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                dateFormat={dateFormat}
                className={cn(className, "w-full text-sm")}
                placeholderText={placeholder}
                disabled={disabled}
                maxDate={new Date()} // Prevent future dates
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                autoComplete="off"
                isClearable={false}
            />
        </div>
    );
};

export default DateRangePicker;
