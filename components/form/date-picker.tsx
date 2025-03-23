"use client";

import "react-datepicker/dist/react-datepicker.css";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import DatePicker from "react-datepicker";

import { Button } from "@/components/form/button";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onSelect: any;
}

export default function CustomDatePicker({
  name,
  defaultValue,
  required = false,
  disabled = false,
  className,
  onSelect,
}: CustomDatePickerProps) {
  const [date, setDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (date: Date | null) => {
    onSelect(date);
    setDate(date);
    setIsOpen(false);
  };

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="hidden"
        name={name}
        value={date ? format(date, "yyyy-MM-dd") : ""}
        required={required}
      />

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={toggleCalendar}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-stone-500 dark:text-stone-400",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>

        {isOpen && (
          <div className="absolute z-50 mt-1">
            <DatePicker
              selected={date}
              onChange={handleChange}
              onClickOutside={handleClickOutside}
              inline
              showMonthDropdown
              showYearDropdown
              yearDropdownItemNumber={300}
              scrollableYearDropdown
              dropdownMode="select"
              openToDate={date || undefined}
              showPopperArrow={false}
              todayButton="Today"
              className="rounded-md border border-stone-200 bg-white shadow-md dark:border-stone-700 dark:bg-stone-800"
              calendarClassName="   rounded-md shadow-lg p-2"
              dayClassName={(d) =>
                d.getDate() === date?.getDate() &&
                d.getMonth() === date?.getMonth() &&
                d.getFullYear() === date?.getFullYear()
                  ? "bg-stone-900 text-white rounded-md dark:bg-stone-100 dark:text-stone-900"
                  : "hover:bg-stone-100 dark:hover:bg-stone-700 rounded-md"
              }
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="flex items-center justify-between px-2 py-1">
                  <button
                    title="Previous Month"
                    type="button"
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className="rounded-full p-1 hover:bg-stone-100 disabled:opacity-50 dark:hover:bg-stone-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex space-x-2">
                    <select
                      title="Select Month"
                      value={date.getMonth()}
                      onChange={({ target: { value } }) =>
                        changeMonth(parseInt(value))
                      }
                      className="rounded border border-stone-200 bg-transparent p-1 text-sm dark:border-stone-700 "
                    >
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, i) => (
                        <option key={month} value={i}>
                          {month}
                        </option>
                      ))}
                    </select>

                    <select
                      title="Select Year"
                      value={date.getFullYear()}
                      onChange={({ target: { value } }) =>
                        changeYear(parseInt(value))
                      }
                      className="rounded border border-stone-200 bg-transparent p-1 text-sm dark:border-stone-700 "
                    >
                      {Array.from(
                        { length: new Date().getFullYear() - 1800 + 100 }, // From 1800 to current year + 100
                        (_, i) => 1800 + i,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    title="Next Month"
                    type="button"
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className="rounded-full p-1 hover:bg-stone-100 disabled:opacity-50 dark:hover:bg-stone-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            />
            <div className="mt-2 flex justify-end border-t border-stone-200 p-2 dark:border-stone-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDate(null);
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
