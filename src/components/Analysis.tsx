import React, { useState } from "react";
import quip from "quip-apps-api";
import { RootEntity } from "../model/root";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import UserInfo from "./UserInfo";
export default () => {
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  const playCountData = rootRecord.get("playCount")?.data;
  let totalViews = 0;
  if (playCountData) {
    totalViews = Object.keys(playCountData)
      .map((userId: string) => playCountData[userId].count)
      .reduce(( prev, curr) => prev + curr, 0);
  }

  const generateRows = () => {
    if (!playCountData) return <></>;
    console.log(playCountData)
    return (
      <>
        {Object.keys(playCountData)
          .sort((e1, e2) => {
            const value1 =
              sortOrder === "desc"
                ? playCountData[e2].count
                : playCountData[e1].count;
            const value2 =
              sortOrder === "desc"
                ? playCountData[e1].count
                : playCountData[e2].count;
            return value1 - value2;
          })
          .map((userId: any) => {
            return (
              <>
                <tr>
                  <td>
                    <UserInfo userId={userId}></UserInfo>
                  </td>
                  <td className="text-right">{playCountData[userId].count}</td>
                  <td>
                    {moment(playCountData[userId].actionTimestamp).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </td>
                </tr>
              </>
            );
          })}
      </>
    );
  };

  return (
    <div className="analysis">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>
              <FontAwesomeIcon
                icon={sortOrder === "desc" ? faArrowUp : faArrowDown}
                color="white"
                style={{
                  cursor: "pointer",
                  height: "14px",
                  width: "14px",
                  marginRight: 5,
                }}
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
              />
              Total views: {totalViews}
            </th>
            <th>Last viewed</th>
          </tr>
        </thead>
        <tbody>{generateRows()}</tbody>
      </table>
    </div>
  );
};
