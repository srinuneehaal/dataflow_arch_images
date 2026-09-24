# Reconciliation: discussion points

Status: Work in progress. GMR writeback is an existing process.

1. ATG preparation: Clone writeback catalogue definitions into GMR_ATG_TRN, including ATG derived properties.
2. FBN loading: The FBN scheduler executes ATG views and inserts their output into FBN_TRN physical tables.
3. GMR loading: Existing writeback inserts or updates GMR_TRN physical tables independently.
4. Comparison: Recon views align records by the configured business key, check presence, and compare the selected fields.
5. Classification: MATCHED means both records exist and compared values agree. MISMATCHED means both exist but compared values differ. MISSING means a corresponding record is absent on one side. Confirm the implemented missing directions.
6. Persistence: The Recon scheduler executes Recon views and inserts classified results into RECON_ATG_TRN.
7. Reporting: Power BI reads RECON_ATG_TRN for TRN_HDR, TRN_CASH_POST, and TRN_TRD.

Reference settings to confirm: The supplied reference shows a five-minute FBN schedule, a rolling 20-day window, PortfolioScope = DLD, and PortfolioCode IN (...). These are not independently verified implementation settings. The Recon scheduler frequency and Power BI refresh mode remain unspecified.

Rules to discuss: actual business keys, compared fields, null handling, tolerances, duplicate keys, missing direction, and comparable input windows.

Closing: We separate source loading, reconciliation logic, result persistence, and report consumption. Timing matters because input delays can produce temporary missing records.
