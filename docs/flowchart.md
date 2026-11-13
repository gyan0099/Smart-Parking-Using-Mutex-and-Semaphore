# Program Flowcharts
## Product 9: Smart Parking Slot Allocation System
**Course:** 25CAI402PC203 Operating Systems and Computer Networks  
**Department of CSE, School of CS & AI, SR University, Warangal**

---

## 1. Vehicle Admission Algorithm Flowchart

```
                 [ Vehicle Arrival at Barrier ]
                               |
                               v
               [ Duplicate Registration Check ]
                               |
            +------------------+------------------+
            | Is vehicle already parked or queued?|
            +------------------+------------------+
                   | YES                     | NO
                   v                         v
        [ Reject Duplicate Entry ]   [ Semaphore.acquire(blocking=False) ]
                                             |
                              +--------------+--------------+
                              | Was permit successfully acquired? |
                              +--------------+--------------+
                                     | YES                  | NO (Capacity Full)
                                     v                      v
                           [ Acquire Mutex Lock ]   [ Acquire Mutex Lock ]
                                     |                      |
                           [ Query Free Bay P_i ]   [ Compute Queue Pos (len+1) ]
                                     |                      |
                           [ Mark P_i OCCUPIED ]    [ Insert Waiting Queue ]
                                     |                      |
                           [ Insert Active Session] [ Commit DB ]
                                     |                      |
                           [ Commit DB ]            [ Release Mutex Lock ]
                                     |                      |
                           [ Release Mutex Lock ]   [ Broadcast: QUEUED ]
                                     |
                           [ Broadcast: PARKED ]
```

---

## 2. Vehicle Exit & Automatic Slot Handover Flowchart

```
                 [ Vehicle Departure at Exit Gate ]
                               |
                               v
                     [ Acquire Mutex Lock ]
                               |
                     [ Query Active Session ]
                               |
                     [ Compute Duration & Fee ]
                               |
                     [ Mark Session COMPLETED ]
                               |
                     [ Clear Bay Assignment ]
                               |
              +----------------+----------------+
              | Is any vehicle waiting in queue? |
              +----------------+----------------+
                     | YES                      | NO
                     v                          v
          [ Pop First Waiting Vehicle ]  [ Mark Bay AVAILABLE ]
                     |                          |
          [ Assign Bay to Waiting Veh ]  [ Semaphore.release() (Signal) ]
                     |                          |
          [ Insert New Active Session ]  [ Commit DB ]
                     |                          |
          [ Re-index Remaining Queue ]   [ Release Mutex Lock ]
                     |                          |
          [ Commit DB ]                  [ Broadcast: BAY FREE ]
                     |
          [ Release Mutex Lock ]
                     |
          [ Broadcast: AUTO-ALLOCATED ]
```
