"use client";

import { useEffect, useState } from "react";

import HeroAttendanceCard from "@/components/common/Heroattendancecard";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { checkInEmployee, checkOutEmployee } from "@/services/employee.service";
import toast from "react-hot-toast";
import { loadEmployeeDashboardData } from "@/services/super-admin.service";

interface Props {
  userName: string;
  checkIn: string | null;
  checkOut: string | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
}

interface Attendance {
  checkin?: string;
  checkout?: string;
  workingHours?: string;
}

const defaultform = {
  checkin: '',
  checkout: '',
  latitude: '',
  longitude: '',
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}



function getLocationErrorMessage(error: GeolocationPositionError | Error) {
  if ("code" in error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission denied. Please allow location access to mark attendance.";
      case error.POSITION_UNAVAILABLE:
        return "Unable to detect your location. Please try again.";
      case error.TIMEOUT:
        return "Location request timed out. Please try again.";
      default:
        return "Failed to get your current location.";
    }
  }
  return error.message || "Failed to get your current location.";
}

export default function Page({
  checkIn,
  checkOut,
  loading = false,
}: Props) {
  const [now, setNow] = useState(new Date());
  const [elapsed, setElapsed] = useState("00h 00m 00s");
  const [form, setForm] = useState(defaultform);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const [employeeAttandance, setEmployeeAttandance] = useState<Attendance | null>(null);


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (checkIn && !checkOut) {
        const start = new Date(checkIn);

        const diff = Math.floor(
          (Date.now() - start.getTime()) / 1000
        );

        const hrs = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;

        setElapsed(
          `${hrs.toString().padStart(2, "0")}h ${mins
            .toString()
            .padStart(2, "0")}m ${secs
              .toString()
              .padStart(2, "0")}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkIn, checkOut]);

  const formatTime = (value: string | null) => {
    if (!value) return "--";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


  const user = useSelector((state: RootState) => state.auth.user);
  const employeeId = user?.employeeId;



  const fetchEmployee = async () => {
    const res = await loadEmployeeDashboardData(employeeId);

    setEmployeeAttandance(res.data.data.attendance);
  }

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId])


  const handleCheckIn = async () => {
    const checkin = new Date().toISOString();

    setCheckingIn(true);

    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;



      setForm((prev: any) => ({
        ...prev,
        checkin,
        latitude,
        longitude
      }));

      const res = await checkInEmployee(employeeId, {
        ...form,
        checkin,
        latitude,
        longitude
      });

      if (res.data.success == true) {
        toast.success(res.data.message);
        await fetchEmployee();
      }
      else {
        toast.error(res.data.message || "Check-in failed");
      }

    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      toast.error(backendMessage || getLocationErrorMessage(error));
    }

    finally {
      setCheckingIn(false);
    }


  };


  const handleChekOut = async () => {
    if (checkingOut) return;

    try {
      setCheckingOut(true);

      const position = await getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const checkout = new Date().toISOString();



      console.log('lat : ', latitude, 'lng : ', longitude);
      // return;
      

      setForm((prev: any) => ({
        ...prev,
        checkout,
        latitude,
        longitude,
      }));

      const res = await checkOutEmployee(employeeId, {
        ...form,
        checkout,
        latitude,
        longitude,
      });

      if (res.data.success === true) {
        toast.success(res.data.message);
        await fetchEmployee();
      } else {
        toast.error(res.data.message || "Check-out failed");
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      toast.error(backendMessage || getLocationErrorMessage(error));
    } finally {
      setCheckingOut(false);
    }
  };

  return (

    <HeroAttendanceCard
      userName={user?.name}
      checkIn={employeeAttandance?.checkin || ''}
      checkOut={employeeAttandance?.checkout || ''}
      onCheckIn={handleCheckIn}
      onCheckOut={handleChekOut}
    />
  );
}
