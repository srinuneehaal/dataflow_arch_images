# ATG / GMR / FBN Transaction Reconciliation

**Status:** Work in progress  
**Existing component:** GMR writeback process  
**Document purpose:** Record the reconciliation design and provide a shared reference for implementation, review, and support.

## 1. Overview

The reconciliation solution compares FBN and GMR transaction data and classifies records as MATCHED, MISMATCHED, or MISSING. Separate processes populate the FBN and GMR physical tables. Recon views compare those inputs, and the Recon scheduler persists the results in RECON_ATG_TRN. Power BI reads the persisted results for reconciliation reporting.

This page describes the intended flow. It does not imply that every component is implemented, tested, or deployed.

## 2. Architecture diagram

Attach **Reconciliation-Process-Data-Flow-v4.png** to this Confluence page and insert it here at full width.

**Diagram title:** ATG / GMR / FBN Transaction Reconciliation

The high-level row summarizes the activities. FBN loading and existing GMR writeback are independent input paths, rather than sequential dependencies. Both physical inputs feed the Recon views. No data transfer between FBN_TRN and GMR_TRN is intended.

## 3. Scope

The design includes:

- ATG views cloned from the writeback catalogue, including ATG derived properties.
- Physical tables for FBN transactions, GMR transactions, and reconciliation results.
- A recurring FBN scheduler to execute the ATG views and insert transaction data.
- Integration with the existing GMR writeback process.
- Recon views to classify differences between FBN and GMR records.
- A recurring Recon scheduler to persist comparison results.
- A Power BI report that reads the persisted results.

Transaction table examples in the reporting scope include TRN_HDR, TRN_CASH_POST, and TRN_TRD. Exact deployed object names and coverage should be recorded as implementation progresses.

## 4. Components and responsibilities

| Component | Responsibility | Input | Output |
| --- | --- | --- | --- |
| Writeback catalogue | Supplies definitions to clone, including ATG derived properties | Existing catalogue definitions | ATG view definitions |
| GMR_ATG_TRN | Exposes transaction data through the cloned ATG views | Underlying source data and derived property logic | Rows consumed by the FBN scheduler |
| FBN Scheduler | Repeatedly executes ATG views and inserts the output | GMR_ATG_TRN view output | FBN_TRN physical tables |
| FBN_TRN | Persists the FBN side of the comparison | FBN scheduler inserts | FBN records for Recon views |
| Existing GMR writeback | Inserts or updates GMR transaction records | Existing writeback inputs | GMR_TRN physical tables |
| GMR_TRN | Persists the GMR side of the comparison | Existing writeback inserts and updates | GMR records for Recon views |
| Recon views | Aligns and compares the physical inputs | FBN_TRN and GMR_TRN | Classified reconciliation output |
| Recon Scheduler | Repeatedly executes Recon views and inserts results | Recon view output | RECON_ATG_TRN physical tables |
| RECON_ATG_TRN | Persists reconciliation results | Recon scheduler inserts | Results consumed by Power BI |
| Power BI Recon ATG report | Presents reconciliation results for analysis | RECON_ATG_TRN | Reconciliation reporting |

Object names above follow the supplied design and may represent groups of views or physical tables. They do not specify database schemas or deployment boundaries.

## 5. Process and data flow

### 5.1 Create the ATG views

Clone the relevant writeback catalogue definitions to create GMR_ATG_TRN views. Include the ATG derived properties required in the view output.

Catalogue cloning is a configuration activity. The recurring data load executes the resulting views. Despite the GMR prefix in GMR_ATG_TRN, the supplied design uses these views to populate the FBN path.

### 5.2 Create physical storage

Create the physical tables required to persist FBN_TRN, GMR_TRN, and RECON_ATG_TRN data. The first two groups hold comparison inputs. The third holds classified results.

### 5.3 Load FBN transactions

The FBN scheduler repeatedly executes GMR_ATG_TRN views and inserts their output into FBN_TRN. The implementation must define the load window and how repeated executions handle previously loaded records.

### 5.4 Maintain GMR transactions

The existing GMR writeback process inserts or updates GMR_TRN. This process independently supplies the other comparison input.

### 5.5 Execute reconciliation

Recon views read FBN_TRN and GMR_TRN, align records using the configured business key, check record presence, and compare configured fields for corresponding records.

### 5.6 Persist results

The Recon scheduler repeatedly executes the Recon views and inserts their classified output into RECON_ATG_TRN. The result retention and rerun behavior remain implementation details to document.

### 5.7 Consume results in Power BI

The Recon ATG report reads RECON_ATG_TRN. Power BI refresh or connection settings determine when persisted results become visible to report users.

## 6. Reconciliation logic

The following is a conceptual description. It does not prescribe the join implementation, business key, or field comparison expressions.

1. Select the FBN and GMR records within the applicable reconciliation scope.
2. Align corresponding records using the configured business key for each transaction table.
3. Check whether the corresponding record exists on both sides.
4. If both records exist, compare the configured fields using the implemented comparison rules.
5. Emit the applicable reconciliation status.

| Status | Meaning | Illustrative example |
| --- | --- | --- |
| MATCHED | Corresponding records exist on both sides and the compared values agree | The same transaction has equal values for every compared field |
| MISMATCHED | Corresponding records exist on both sides, but at least one compared value differs | The same transaction has a different value in one compared field |
| MISSING | A corresponding record is absent on one side within the directions checked by the implementation | A record exists in FBN but has no corresponding GMR record |

The examples explain classification only and are not production evidence. Missing-record checks may need to cover both FBN-only and GMR-only records. The implemented directions must be confirmed.

Input timing affects interpretation: a delayed load can temporarily appear as a missing record. A MISSING status alone does not establish the cause.

## 7. Scheduling and filter configuration

The reference diagram includes the following FBN settings. They are reference values to confirm against the implementation.

| Setting | Reference value | Verification status |
| --- | --- | --- |
| FBN scheduler frequency | Every 5 minutes | To confirm |
| FBN transaction window | Rolling last 20 days | To confirm |
| Portfolio scope filter | PortfolioScope = DLD | To confirm |
| Portfolio code filter | PortfolioCode IN (...) | Actual values to confirm |
| Recon scheduler frequency | Not specified | To define or record |
| Power BI refresh or connection mode | Not specified | To define or record |

Do not infer that the Recon scheduler uses the FBN scheduler interval. Recurring execution does not by itself guarantee real-time reporting.

## 8. Implementation details to record

The following items are not established by the supplied design. Record the decisions as they become available.

| Area | Detail to record |
| --- | --- |
| Record identity | Business key for each transaction table and duplicate-key handling |
| Compared values | Included and excluded fields, derived properties, null handling, data-type conversion, and any tolerances |
| Missing records | Whether both missing directions are supported and how the absent side is identified |
| Input alignment | Common scope, time zone, window boundaries, and input-readiness checks |
| Repeated FBN loads | Incremental or full-window loading and prevention of unintended duplicates |
| Repeated Recon runs | Append, replace, or other result persistence behavior and handling of reruns |
| Result history | Retention period and how report users identify the applicable run |
| Failures | Retry behavior, partial-run handling, monitoring, and support ownership |
| Catalogue changes | How cloned definitions and derived properties remain consistent with the source catalogue |
| Report consumption | Connection mode, refresh schedule, and behavior when upstream data is delayed |

## 9. Suggested validation scenarios

These scenarios are proposed checks, not completed test results.

| Scenario | Expected validation |
| --- | --- |
| Equal records on both sides | The view emits MATCHED under the configured comparison rules |
| One compared field differs | The view emits MISMATCHED |
| FBN record lacks a GMR counterpart | The view emits MISSING if this direction is supported |
| GMR record lacks an FBN counterpart | The view emits MISSING if this direction is supported |
| Null or empty compared values | Classification follows the documented field rules |
| Duplicate business keys | Behavior follows the documented duplicate-handling policy |
| Repeated execution over the same scope | Persistence follows the documented rerun policy without unintended duplication |
| Delayed input loading | Results can be interpreted against the input window and readiness state |
| Scheduler failure or partial load | Recovery follows the documented failure-handling policy |
| Power BI consumption | Displayed results correspond to the intended persisted result set |

## 10. Current status and ownership

The overall reconciliation work is in progress. GMR writeback is an existing process. Individual component completion, deployment environments, and test evidence have not been provided.

| Responsibility | Owner |
| --- | --- |
| ATG catalogue and derived properties | To assign |
| FBN scheduler and transaction loads | To assign |
| Existing GMR writeback | To record |
| Recon views and comparison rules | To assign |
| Recon scheduler and result storage | To assign |
| Power BI reporting | To assign |
| Operational support | To assign |

## 11. Supporting material

- Architecture image: Reconciliation-Process-Data-Flow-v4.png
- Presentation discussion points: ATG-GMR-FBN-Discussion-Points.md

Add repository, scheduler, report, and implementation-ticket links when available.
