import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosInstance } from "axios";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";

type AlertTypes = "success" | "error";

export const useS3Upload = <dataType, dataReturn>(
  filePath: string,
  fileName: string,
  image: File | null,
  apiPath: string,
  apiMethod: string,
  data: dataType,
  dataCallback: (
    data: dataType,
    uploadUrl: { message: string; response: string }
  ) => dataReturn,
  alertSuccessMessage: string,
  completedCallback?: (uploadUrl?: string) => void
) => {
  const [progress, setProgress] = useState({ show: false, value: 0 });
  const [alertStatus, setAlertStatus] = useState<{
    show: boolean;
    type: AlertTypes;
    message: string;
  }>({ show: false, type: "success", message: "" });
  const { refetch: s3Upload } = useQuery<
    { message: string; response: string },
    AxiosError
  >(
    ["getUploadUrl"],
    async () =>
      (
        await axiosClient.get(
          `/admin/s3url?filename=${fileName}&path=${filePath}`
        )
      ).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        uploadImg(data);
      },
      onError: (error) => {
        console.error(error);
        setAlertStatus({
          show: true,
          type: "error",
          message: error.message,
        });
      },
    }
  );
  const { mutate: uploadImg } = useMutation<
    any,
    AxiosError,
    { message: string; response: string }
  >(
    async (uploadUrl) => {
      if (uploadUrl) {
        setProgress((state) => ({ ...state, show: true }));
        await axiosClient.put(uploadUrl.response, image, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setProgress((state) => ({ ...state, value: percentCompleted }));
            if (percentCompleted === 100)
              setTimeout(() => {
                setProgress({ value: 0, show: false });
              }, 1000);
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        setProgress((state) => ({ ...state, show: false }));
        throw new Error("Upload url undefined");
      }
    },
    {
      onSuccess: (_, uploadUrl) => {
        const newData = dataCallback(data, uploadUrl);
        uploadCallback({
          data: newData,
          uploadUrl: uploadUrl?.response.split("?")[0],
        });
      },
      onError: (error) => {
        console.error(error);
        setAlertStatus({
          show: true,
          type: "error",
          message: error.message,
        });
      },
    }
  );
  const { mutate: uploadCallback } = useMutation<
    any,
    AxiosError,
    { data: dataReturn; uploadUrl: string }
  >(
    async ({ data }) => {
      switch (apiMethod) {
        case "post":
          return (await axiosClient.post(apiPath, data)).data;
        case "put":
          return (await axiosClient.put(apiPath, data)).data;
        default:
          throw new Error("Invalid http method");
      }
    },
    {
      onSuccess: (_, params) => {
        if (completedCallback) completedCallback(params.uploadUrl);
        setAlertStatus({
          show: true,
          type: "success",
          message: alertSuccessMessage,
        });
        setTimeout(() => {
          setAlertStatus({
            show: false,
            type: "success",
            message: alertSuccessMessage,
          });
        }, 5000);
      },
      onError: (error) => {
        console.error(error);
        setAlertStatus({
          show: true,
          type: "error",
          message: error.message,
        });
      },
    }
  );
  return { s3Upload, setAlertStatus, progress, alertStatus };
};
