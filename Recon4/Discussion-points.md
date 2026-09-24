# Reconciliation presentation: discussion points

15 minutes total, including a four-minute demo.

## 1. Reconciliation architecture and data flow (0:30)

Opening: Today I will walk through how we populate the FBN and GMR transaction tables, compare them, and expose reconciliation results in Power BI. The scope includes ATG views, persistent tables, comparison views, recurring schedulers, and the report. GMR writeback is the existing process. The reconciliation components are work in progress. Explain the intended architecture and demonstrate only currently available functionality. Spend 30 seconds here, then move to the architecture.

## 2. Architecture overview: work in progress (3:00)

Read the diagram from left to right. The writeback catalogue supplies the definitions cloned into GMR_ATG_TRN, including ATG derived properties. This is a configuration relationship, not a transaction stream. The FBN scheduler repeatedly executes the ATG views and inserts their output into FBN_TRN. Independently, the existing writeback process inserts or updates GMR_TRN. Recon views compare these two physical inputs. The Recon scheduler executes the comparison views and inserts their output into RECON_ATG_TRN. Power BI reads this persisted result. Solid connectors represent data movement. Dashed connectors represent configuration or execution. The source behind the ATG view is not specified and is therefore not invented. Despite its GMR prefix, GMR_ATG_TRN feeds the FBN path in the supplied workflow.

## 3. ATG views and the FBN data flow (2:00)

Explain the preparation step first: clone the writeback catalogue definitions to create the ATG views named GMR_ATG_TRN and include the ATG derived properties. These properties are part of the view output available for reconciliation. Explain the runtime step next: the FBN scheduler repeatedly executes the ATG views and inserts rows into the FBN_TRN physical tables. The catalogue cloning is a setup activity, while scheduler execution is recurring. Avoid naming an interval or calling this real time until the actual schedule is confirmed. Discuss how catalogue changes and derived property changes are kept consistent. Confirm the incremental or full load strategy and duplicate handling before making claims about them.

## 4. Physical tables and the existing GMR flow (1:00)

The three physical table groups separate the two comparison inputs from the persisted results. FBN_TRN stores output loaded by the FBN scheduler. GMR_TRN stores the records inserted or updated by the existing writeback process. RECON_ATG_TRN stores the results inserted by the Recon scheduler. This means the reporting layer reads the stored reconciliation output. The report covers transaction tables such as TRN_HDR, TRN_CASH_POST, and TRN_TRD. These names are logical groups as provided, not asserted database schemas or deployment boundaries.

## 5. Recon views and result classification (2:00)

Recon views compare the FBN_TRN and GMR_TRN physical tables and produce MATCHED, MISMATCHED, and MISSING results. The descriptions on this slide are conceptual definitions: MATCHED means a corresponding record exists on both sides and the compared values agree. MISMATCHED means a corresponding record exists on both sides but at least one compared value differs. MISSING means a record exists on only one side. Confirm whether the current implementation checks missing records in both directions. The actual business keys, compared columns, null handling, rounding, and tolerance rules are not supplied. Describe the rules in your implementation rather than implying exact equality for every field. Records need a comparable load window to avoid temporary missing results caused by timing.

## 6. Recon scheduler and result persistence (1:00)

The recurring Recon scheduler executes the Recon views, obtains classified results, and inserts them into RECON_ATG_TRN. Power BI then reads that physical table. Explain the separation between comparison logic in the views and recurring execution in the scheduler. The exact frequency, readiness dependency on FBN and GMR, failure handling, and history or replacement behavior are unspecified. Present these as operational discussion points. A continuously recurring job does not by itself guarantee real-time report freshness. Report freshness also depends on the data loading and Power BI connection or refresh mode.

## 7. Power BI report and demo walkthrough (4:00)

Transition: Now I will trace this architecture in the actual reconciliation report. Use one prepared transaction and an available completed run. First 30 seconds: show the Recon ATG report and identify RECON_ATG_TRN as its source. Next 45 seconds: show coverage for TRN_HDR, TRN_CASH_POST, and TRN_TRD using the pages or filters that actually exist. Next 60 seconds: show a MATCHED example and explain why the compared values agree. Next 60 seconds: show a MISMATCHED example and identify one differing field, then show a MISSING example and identify the absent side if the report exposes it. Final 45 seconds: trace the chosen record back to the physical input tables and describe its scheduler run or load window using available evidence. These are demo suggestions, not claims that every drill-through or filter already exists. Use prepared screenshots if the live environment is unavailable. Avoid triggering a long-running job during the four-minute demo.

## 8. Key takeaways and team discussion (1:30)

Close in 30 seconds: The ATG views and FBN scheduler supply one side of reconciliation. Existing GMR writeback supplies the other. Recon views classify differences, the Recon scheduler persists results, and Power BI makes those results visible by transaction table. Use the remaining minute for team questions. If asked about matching keys, interval, tolerance, refresh, or reruns, use the actual implementation details and do not invent a value. Suggested follow-up questions include who owns catalogue changes, how to distinguish an actual missing record from delayed loading, and what the operating procedure is for failed scheduler runs. No performance metrics or implementation completion claims have been assumed.
