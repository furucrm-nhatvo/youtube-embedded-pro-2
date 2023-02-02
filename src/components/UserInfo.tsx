import quip from 'quip-apps-api'
import React, { useEffect, useState } from 'react'

export default function UserInfo(props: any) {
  const [userRecord, setUserRecord] = useState(quip.apps.getUserById(props.userId))
  useEffect(() => {
    if (quip.apps.getUserById(props.userId)) {
      setUserRecord(quip.apps.getUserById(props.userId))
    }
  })
  return <div style={{ display: "flex", alignItems: "center", height:'35px' }}>
    {/* {userRecord && (
      <quip.apps.ui.ProfilePicture
        user={userRecord}
        size={24}
        round={true}
      />
    )} */}
    <p className="ml-5">{userRecord?.getName()}</p>
  </div>
}


