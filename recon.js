(async () => {
  // =========================================================
  // GMR/FBN TRANSACTION RECONCILIATION - EDITABLE MIRO BOARD
  // =========================================================

  // ---------- Helpers ----------
  async function box({
    content,
    x,
    y,
    width = 320,
    height = 170,
    fillColor = "#FFFFFF",
    borderColor = "#1F4E79",
    fontSize = 20
  }) {
    return await miro.board.createShape({
      shape: "round_rectangle",
      content: `<p>${content}</p>`,
      x,
      y,
      width,
      height,
      style: {
        fillColor,
        borderColor,
        borderWidth: 2,
        color: "#172B4D",
        fontSize,
        textAlign: "center",
        textAlignVertical: "middle"
      }
    });
  }

  async function title(content, x, y, width = 900, fontSize = 34) {
    return await miro.board.createText({
      content: `<p><strong>${content}</strong></p>`,
      x,
      y,
      width,
      style: {
        fontSize,
        textAlign: "center",
        color: "#172B4D"
      }
    });
  }

  async function connect(start, end, label = "", color = "#344563") {
    return await miro.board.createConnector({
      shape: "elbowed",
      style: {
        strokeColor: color,
        strokeWidth: 3,
        endStrokeCap: "stealth"
      },
      start: {
        item: start.id,
        position: { x: 1, y: 0.5 }
      },
      end: {
        item: end.id,
        position: { x: 0, y: 0.5 }
      },
      captions: label
        ? [
            {
              content: label,
              position: 0.5
            }
          ]
        : []
    });
  }

  // =========================================================
  // TITLE
  // =========================================================
  await title(
    "GMR/FBN Transaction Reconciliation – Detailed Data Flow",
    1600,
    -650,
    1800,
    38
  );

  // =========================================================
  // 1. SOURCE CATALOGS
  // =========================================================

  const writeback = await box({
    content:
      "<strong>writeback.trn_*</strong><br><br>Source Views<br><br>Original transaction views",
    x: 0,
    y: 0,
    fillColor: "#EAF2FF",
    borderColor: "#2563EB"
  });

  const gmrSource = await box({
    content:
      "<strong>Sql.Db.Gmr.trn_*</strong><br><br>GMR Source<br><br>GMR transaction source",
    x: 0,
    y: 300,
    fillColor: "#ECFDF3",
    borderColor: "#16A34A"
  });

  const fbnSource = await box({
    content:
      "<strong>Sql.Db.Fbn.Trn.trn_*</strong><br><br>FBN Source<br><br>FBN transaction source",
    x: 0,
    y: 600,
    fillColor: "#F3EEFF",
    borderColor: "#7C3AED"
  });

  // =========================================================
  // 2. CLONED / STAGING VIEWS
  // =========================================================

  const gmrAtg = await box({
    content:
      "<strong>GMR_ATG_TRN</strong><br><br>Cloned Views / Staging<br><br>Views cloned from writeback.trn_*",
    x: 550,
    y: 0,
    width: 360,
    height: 210,
    fillColor: "#E8F8FA",
    borderColor: "#0891B2"
  });

  const stagingExplanation = await box({
    content:
      "<strong>What is this?</strong><br><br>Intermediate staging layer.<br><br>Scheduler reads prepared transaction views from here.",
    x: 550,
    y: 280,
    width: 360,
    height: 220,
    fillColor: "#F7FCFD",
    borderColor: "#67C5D2",
    fontSize: 17
  });

  // =========================================================
  // 3. PHYSICAL TABLES
  // =========================================================

  const gmrTable = await box({
    content:
      "<strong>GMR_TRN</strong><br><br>Physical Table<br><br>Stores GMR transactions",
    x: 1100,
    y: 100,
    fillColor: "#ECFDF3",
    borderColor: "#16A34A"
  });

  const fbnTable = await box({
    content:
      "<strong>FBN_TRN</strong><br><br>Physical Table<br><br>Stores FBN transactions",
    x: 1100,
    y: 520,
    fillColor: "#F3EEFF",
    borderColor: "#7C3AED"
  });

  // =========================================================
  // 4. SCHEDULER
  // =========================================================

  const scheduler = await box({
    content:
      "<strong>Scheduler Job</strong><br><br>Runs every 5 minutes",
    x: 1650,
    y: -50,
    fillColor: "#FFF7E6",
    borderColor: "#F59E0B"
  });

  const readData = await box({
    content:
      "<strong>Step 1 – Read Data</strong><br><br>Read FBN-related transactions from GMR_ATG_TRN",
    x: 1650,
    y: 190,
    width: 390,
    height: 190,
    fillColor: "#FFF9EF",
    borderColor: "#F59E0B",
    fontSize: 17
  });

  const filter = await box({
    content:
      "<strong>Step 2 – Filter Logic</strong><br><br>PortfolioScope = 'DLD'<br>PortfolioCode IN (...)<br>EntryDateTime between<br>NOW - 20 days and NOW",
    x: 1650,
    y: 450,
    width: 390,
    height: 250,
    fillColor: "#FFF9EF",
    borderColor: "#F59E0B",
    fontSize: 17
  });

  const writer = await box({
    content:
      "<strong>Step 3 – Select Writer</strong><br><br>ToWrite = @data<br>LIMIT 1",
    x: 1650,
    y: 770,
    width: 390,
    height: 180,
    fillColor: "#FFF9EF",
    borderColor: "#F59E0B",
    fontSize: 17
  });

  const load = await box({
    content:
      "<strong>Step 4 – Insert</strong><br><br>Insert selected transactions into reconciliation results",
    x: 1650,
    y: 1020,
    width: 390,
    height: 190,
    fillColor: "#FFF9EF",
    borderColor: "#F59E0B",
    fontSize: 17
  });

  const rollingWindow = await box({
    content:
      "<strong>Why 20 days?</strong><br><br>Rolling window allows recent transactions to continue being checked and reconciled.",
    x: 2110,
    y: 450,
    width: 300,
    height: 220,
    fillColor: "#F3F8FF",
    borderColor: "#4C9AFF",
    fontSize: 16
  });

  const fiveMinutes = await box({
    content:
      "<strong>Why every 5 minutes?</strong><br><br>Keeps reconciliation data fresh and close to real time.",
    x: 2110,
    y: 760,
    width: 300,
    height: 200,
    fillColor: "#F3F8FF",
    borderColor: "#4C9AFF",
    fontSize: 16
  });

  // =========================================================
  // 5. RECONCILIATION
  // =========================================================

  const recResults = await box({
    content:
      "<strong>Rec_results</strong><br><br>Sql.Db.Recon_ATG<br><br>Stores transactions loaded by scheduler",
    x: 2600,
    y: 250,
    width: 360,
    height: 210,
    fillColor: "#F3EEFF",
    borderColor: "#6554C0"
  });

  const comparison = await box({
    content:
      "<strong>Comparison View</strong><br><br>Recon_ATG<br><br>Compare FBN_TRN vs GMR_TRN<br><br>Identify matches and mismatches",
    x: 2600,
    y: 650,
    width: 390,
    height: 260,
    fillColor: "#F3EEFF",
    borderColor: "#6554C0"
  });

  // =========================================================
  // 6. POWER BI
  // =========================================================

  const powerBI = await box({
    content:
      "<strong>📊 Power BI Report</strong><br><br>Reads reconciliation results<br><br>Reporting • Monitoring • Analysis",
    x: 3250,
    y: 500,
    width: 390,
    height: 250,
    fillColor: "#FFF0F6",
    borderColor: "#DB2777"
  });

  // =========================================================
  // CONNECTORS
  // =========================================================

  await connect(writeback, gmrAtg, "Clone Views", "#2563EB");

  await connect(gmrSource, gmrTable, "Create / Load", "#16A34A");

  await connect(fbnSource, fbnTable, "Create / Load", "#7C3AED");

  await connect(gmrAtg, readData, "Transaction Views", "#0891B2");

  await connect(readData, filter, "");

  await connect(filter, writer, "");

  await connect(writer, load, "");

  await connect(load, recResults, "Insert Results", "#6554C0");

  await connect(gmrTable, comparison, "GMR Transactions", "#16A34A");

  await connect(fbnTable, comparison, "FBN Transactions", "#7C3AED");

  await connect(recResults, comparison, "Reconciliation Data", "#6554C0");

  await connect(comparison, powerBI, "Report Data", "#DB2777");

  // =========================================================
  // KEY DATA ELEMENTS
  // =========================================================

  await title("Key Data Elements", 1550, 1400, 700, 27);

  await box({
    content:
      "🕒 <strong>EntryDateTime</strong><br>Transaction time",
    x: 600,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#4C9AFF",
    fontSize: 16
  });

  await box({
    content:
      "💼 <strong>PortfolioScope</strong><br>'DLD'",
    x: 950,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#36B37E",
    fontSize: 16
  });

  await box({
    content:
      "📄 <strong>PortfolioCode</strong><br>IN (...)",
    x: 1300,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#6554C0",
    fontSize: 16
  });

  await box({
    content:
      "👤 <strong>ToWrite</strong><br>@data / Top Writer",
    x: 1650,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#FF991F",
    fontSize: 16
  });

  await box({
    content:
      "🕘 <strong>Rolling Window</strong><br>Last 20 days",
    x: 2000,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#00B8D9",
    fontSize: 16
  });

  await box({
    content:
      "🎯 <strong>Frequency</strong><br>Every 5 minutes",
    x: 2350,
    y: 1550,
    width: 270,
    height: 120,
    fillColor: "#F7F9FC",
    borderColor: "#E83E8C",
    fontSize: 16
  });

  // =========================================================
  // OUTCOME
  // =========================================================

  await box({
    content:
      "<strong>Outcome</strong><br><br>✓ Recent FBN transactions are loaded<br>✓ GMR and FBN data are reconciled<br>✓ Matches / mismatches can be identified<br>✓ Results become available to Power BI",
    x: 3100,
    y: 1450,
    width: 570,
    height: 300,
    fillColor: "#F5FFF7",
    borderColor: "#36B37E",
    fontSize: 18
  });

  // Zoom to all created content.
  const items = await miro.board.get();
  await miro.board.viewport.zoomTo(items);

  console.log("GMR/FBN editable reconciliation diagram created.");
})();