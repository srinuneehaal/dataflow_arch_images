# ATG / GMR / FBN Transaction Reconciliation

## Opening
“Today I will walk through the ATG, GMR, and FBN transaction reconciliation process: how we prepare the views, load the transaction tables, compare records, and make the results available in Power BI.”

The reconciliation work is in progress. The GMR writeback process already exists.

## High-level process
Use the top row to introduce the seven activities. The FBN and GMR loading paths operate independently and meet at the comparison step.

1. Clone ATG views from the writeback catalogue, including ATG derived properties.
2. Create physical tables to persist FBN transactions, GMR transactions, and reconciliation results.
3. Load FBN transactions by executing the ATG views through the FBN scheduler.
4. Maintain GMR transactions through the existing writeback process.
5. Compare the FBN and GMR records using the Recon views.
6. Persist the classified results through the Recon scheduler.
7. Present the stored reconciliation results in Power BI.

## Detailed data flow

### 1. ATG views and FBN loading
“We clone the writeback catalogue definitions into GMR_ATG_TRN and include the ATG derived properties. The FBN scheduler executes these views and inserts their output into the FBN_TRN physical tables.”

Explain that catalogue cloning is a configuration activity. Loading transaction data is a recurring runtime activity. Although the view is named GMR_ATG_TRN, its output feeds the FBN path in this design.

The diagram retains the reference settings of a five-minute schedule, the last 20 days, PortfolioScope = DLD, and PortfolioCode IN (...). Describe these as reference settings to confirm, not verified production settings.

### 2. Existing GMR writeback
“The existing GMR writeback process inserts or updates the GMR_TRN physical tables. This supplies the second input for reconciliation.”

Point to the separate GMR lane. There is no intended transfer between FBN_TRN and GMR_TRN: both independently feed the Recon views.

### 3. Reconciliation logic
“The Recon views align FBN and GMR records by the configured business key, check whether the corresponding records exist, and compare the configured fields when both records are present.”

Explain each result:
- MATCHED: A corresponding record exists on both sides and the compared values agree.
- MISMATCHED: A corresponding record exists on both sides, but at least one compared value differs.
- MISSING: A corresponding record is absent on one side, within the directions checked by the implementation.

Use one available example per status. For a mismatch, identify the differing field. For a missing record, identify the absent side. Avoid claiming specific keys, comparison tolerances, or null handling unless verified in the implementation.

### 4. Recon scheduler and result persistence
“The Recon scheduler executes the Recon views and inserts their classified output into RECON_ATG_TRN. This physical table holds the reconciliation results used for reporting.”

Distinguish the two scheduler responsibilities: the FBN scheduler loads the transaction input, while the Recon scheduler persists the comparison output. The diagram does not specify a Recon scheduler interval.

### 5. Power BI reporting
“The Recon ATG report reads the persisted results from RECON_ATG_TRN and presents them for reconciliation analysis.”

Trace one available report result back through its classification to the FBN and GMR input records. Report freshness depends on input loading, reconciliation execution, and the Power BI connection or refresh configuration.

## Closing
“The flow has two transaction inputs and one reconciliation output. ATG views and the FBN scheduler populate FBN_TRN. Existing writeback maintains GMR_TRN. Recon views classify the differences, the Recon scheduler persists the results, and Power BI presents them for analysis.”

## Suggested 15-minute delivery
- Opening and high-level process: 2 minutes
- ATG/FBN loading and existing GMR flow: 3 minutes
- Reconciliation logic: 3 minutes
- Result persistence and reporting: 2 minutes
- Available demo examples: 4 minutes
- Closing and questions: 1 minute
