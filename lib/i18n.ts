import { SessionStage } from "@prisma/client";

export const defaultLocale = "sv";
export const localeCookieName = "gin-der-locale";

export const locales = ["sv", "en"] as const;
export type Locale = (typeof locales)[number];

export function normalizeLocale(value?: string | null): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export const messages = {
  sv: {
    common: {
      appName: "gin-der",
      swedish: "Svenska",
      english: "English",
      joinCode: "Anslutningskod",
      copyJoinCode: "Kopiera kod",
      copyJoinLink: "Kopiera länk",
      copied: "Kopierad",
      copyFailed: "Kunde inte kopiera",
      noDate: "Inget datum satt ännu",
      noDateSet: "Inget smakningsdatum satt",
      noAbv: "ABV saknas",
      participantsSingular: "deltagare",
      participantsPlural: "deltagare",
      guestsSingular: "gäst",
      guestsPlural: "gäster",
      ginsSingular: "gin",
      ginsPlural: "gins",
      notesSingular: "notering",
      notesPlural: "noteringar",
      average: "Snitt",
      step: "Steg",
      gin: "Gin",
      none: "Ingen",
    },
    home: {
      badge: "Botanica tasting room",
      title: "En botanisk smakningsapp byggd för mobilerna runt bordet.",
      description:
        "Kör en ginflight på ditt lokala nätverk, led rummet från adminpanelen och avslöja gruppens smakprofiler när glasen är tomma.",
      joinCta: "Gå med i en smakning",
      adminCta: "Öppna adminpanelen",
      recentSessionsTitle: "Senaste sessionerna",
      recentSessionsDescription: "Hoppa direkt in i allt som fortfarande är aktivt på nätverket.",
      open: "Öppna",
      noSessions: "Inga sessioner ännu. Gå till adminpanelen och skapa din första flight.",
      flowTitle: "Kvällens smakningsflöde",
      flowSteps: [
        "Gäster går med från sina telefoner via en kort kod.",
        "Admin öppnar lobbyn och för rummet vidare genom varje anonym gin.",
        "Deltagarna sätter smakpoäng och helhetsintryck.",
        "Rummet får se avslöjandet och radarprofilerna på slutet.",
      ],
      cards: [
        {
          title: "Synk för hela rummet",
          description: "Scenförändringar skickas direkt så alla ligger på samma gin.",
        },
        {
          title: "Smak först",
          description: "Fånga enbär, citrus, floralt, krydda, örtighet och sötma i ett kort.",
        },
        {
          title: "Redo för avslöjande",
          description: "Jämför egna noteringar med gruppens snitt och hitta kvällens favorit.",
        },
      ],
    },
    join: {
      badge: "Gå med via mobilen",
      title: "Kliv in i smakningsrummet",
      description: "Använd koden från värden för att gå direkt till den aktiva smakningsvyn.",
      openTasting: "Öppna smakningen",
      codePlaceholder: "ABC123",
      invalidCode: "Skriv en giltig kod för att öppna smakningen.",
    },
    admin: {
      dashboardLabel: "Adminpanel",
      createTitle: "Skapa nästa smakningsflight",
      createDescription:
        "Bygg en session, sätt en valfri admin-PIN och hoppa direkt in i kontrollrummet.",
      sessionsTitle: "Sessioner",
      sessionsDescription:
        "Befintliga rum ligger kvar här så att du snabbt kan öppna en aktiv smakning igen.",
      openControls: "Öppna kontrollrum",
      participantView: "Deltagarvy",
      noSessions: "Inga sessioner ännu. Skapa en till vänster så dyker den upp här.",
      sessionControlsLabel: "Adminkontroller",
      unlockTitle: "Lås upp sessionens kontroller",
      unlockDescription:
        "Skriv in admin-PIN för rummet. Sidan sparar den i en lokal cookie så du kan fortsätta leda från samma enhet.",
      unlockButton: "Lås upp",
      currentAction: "Aktuell värdåtgärd",
      liveStage: "Aktiv fas",
      currentGin: "Aktuell gin",
      guests: "Gäster",
      updating: "Uppdaterar...",
      liveRoomLinks: "Länkar för rummet",
      participantScreen: "Deltagarskärm",
      joinedParticipants: "Anslutna deltagare",
      noParticipants: "Ingen har gått med ännu.",
      flightLineup: "Flightens lineup",
      participantRoom: "Deltagarrum",
      scanToJoin: "Skanna för att gå med",
      deleteSession: "Ta bort smakning",
      deletingSession: "Tar bort...",
      deleteSessionDescription:
        "Ta bort hela smakningen och alla inskickade kort. Detta går inte att ångra.",
      deleteSessionConfirm: "Ta bort smakningen \"{sessionName}\"? Detta går inte att ångra.",
      deleteSessionPinPrompt: "Ange admin-PIN för att ta bort smakningen.",
      deleteSessionPinRequired: "Admin-PIN krävs för att ta bort smakningen.",
      deleteSessionError: "Kunde inte ta bort smakningen.",
      createForm: {
        sessionName: "Sessionsnamn",
        sessionNamePlaceholder: "Fredagsflight med gin",
        defaultSessionName: "Fredagsflight med gin",
        tastingDate: "Smakningsdatum",
        openDatePicker: "Öppna datumväljaren",
        adminPin: "Admin-PIN",
        adminPinPlaceholder: "Valfri — genereras automatiskt om tom",
        lineupTitle: "Ginlista",
        addGin: "Lägg till gin",
        remove: "Ta bort",
        namePlaceholder: "Namn",
        distilleryPlaceholder: "Destilleri",
        abvPlaceholder: "ABV",
        descriptionPlaceholder: "Avslöjande-noter och beskrivning",
        createButton: "Skapa smakningssession",
        creatingButton: "Skapar...",
        createError: "Kunde inte skapa smakningssessionen.",
      },
    },
    session: {
      signedInAs: "Inloggad som",
      cardsSubmitted: "kort inskickade",
      lobbyEyebrow: "Rummet samlas",
      lobbyTitle: "Sitt lugnt, första glaset är snart redo.",
      lobbyDescription:
        "Du stannar på den här sidan medan värden öppnar lobbyn och startar smakningen. Ditt kort dyker upp automatiskt när rummet går vidare.",
      revealTitle: "Avslöja gin",
      yourCard: "Ditt kort",
      overallScore: "Helhetsbetyg",
    },
    participant: {
      joinSessionEyebrow: "Gå med i {sessionName}",
      joinSessionTitle: "Lägg till ditt smakningsnamn",
      joinSessionDescription:
        "När du har gått med är den här enheten kopplad till ditt smakningskort resten av sessionen.",
      yourNamePlaceholder: "Ditt namn",
      joining: "Ansluter...",
      joinButton: "Gå med i smakningen",
      joinError: "Kunde inte ansluta till den här sessionen.",
      sessionClosedTitle: "Smakningen är avslutad",
      sessionClosedDescription:
        "Den här sessionen är redan avslutad och tar inte emot nya deltagare längre.",
      tastingCard: "Smakningskort",
      anonymousPourDescription:
        "Poängsätt det här glaset medan det fortfarande är anonymt. Avslöjandet fyller i flaskdetaljerna när värden går vidare.",
      overallScoreDescription: "Använd hela spannet 1–10.",
      freeNotes: "Fria noteringar",
      notesPlaceholder: "Martini-vänlig? Bra neat? För floral? Fånga känslan direkt.",
      saveButton: "Spara smakningskort",
      savingButton: "Sparar...",
      saveLoaded: "Tidigare sparat kort laddat.",
      saveSuccess: "Kort sparat. Du kan fortsätta justera det tills avslöjandet.",
      saveError: "Kunde inte spara ditt smakningskort.",
    },
    results: {
      reveal: "Resultat",
      title: "Gruppens smakprofil",
      topRated: "Högst betyg",
      roomConsensus: "Rummets snitt",
      youVsRoom: "Du mot rummet",
      groupSeries: "Gruppen",
      youSeries: "Du",
      capturedAcross: "insamlat från",
    },
    flavors: {
      juniper: {
        label: "Enbär",
        hint: "Tallig, resinös ryggrad och klassisk ginstruktur.",
      },
      citrus: {
        label: "Citrus",
        hint: "Citron, grapefrukt, söt apelsin eller limefräschör.",
      },
      floral: {
        label: "Floral",
        hint: "Ros, lavendel, viol eller annan lätt blommig aromatik.",
      },
      spice: {
        label: "Krydda",
        hint: "Koriander, pepparkorn, kardemumma, kanel eller varm kryddighet.",
      },
      herbal: {
        label: "Örtighet",
        hint: "Rotig, jordig, grön, rosmarin, timjan eller angelikalik ton.",
      },
      sweetness: {
        label: "Sötma",
        hint: "Upplevd mjukhet, rundad sockerighet eller sötare avslut.",
      },
    },
    stages: {
      SETUP: "Förberedelse",
      LOBBY: "Lobby",
      TASTING: "Smakning",
      REVEAL: "Avslöjande",
      RESULTS: "Resultat",
      COMPLETED: "Avslutad",
    },
    errors: {
      sessionNotFound: "Sessionen hittades inte.",
      invalidSessionPayload: "Ogiltigt sessionsunderlag.",
      invalidEventDate: "Ogiltigt smakningsdatum.",
      validParticipantName: "Ange ett giltigt deltagarnamn.",
      tastingSessionEnded: "Den här smakningen är redan avslutad.",
      adminPinRequired: "Admin-PIN krävs.",
      invalidAdminPin: "Ogiltig admin-PIN.",
      tastingCardMissingFields: "Smakningskortet saknar obligatoriska fält.",
      participantSessionNotFound: "Deltagarsessionen hittades inte.",
      ginNotFoundForSession: "Gin hittades inte för den här sessionen.",
      tastingNotOpen: "Smakningen är inte öppen för nya kort just nu.",
      currentGinOnly: "Du kan bara spara kort för glaset som är aktivt just nu.",
    },
  },
  en: {
    common: {
      appName: "gin-der",
      swedish: "Svenska",
      english: "English",
      joinCode: "Join code",
      copyJoinCode: "Copy code",
      copyJoinLink: "Copy link",
      copied: "Copied",
      copyFailed: "Could not copy",
      noDate: "No date set yet",
      noDateSet: "No tasting date set",
      noAbv: "ABV not listed",
      participantsSingular: "participant",
      participantsPlural: "participants",
      guestsSingular: "guest",
      guestsPlural: "guests",
      ginsSingular: "gin",
      ginsPlural: "gins",
      notesSingular: "note",
      notesPlural: "notes",
      average: "Average",
      step: "Step",
      gin: "Gin",
      none: "None",
    },
    home: {
      badge: "Botanica tasting room",
      title: "A botanical tasting app built for the phones around your table.",
      description:
        "Run a gin flight on your local network, steer the room from an admin dashboard, and reveal group flavor profiles when the pours are done.",
      joinCta: "Join a tasting",
      adminCta: "Open admin dashboard",
      recentSessionsTitle: "Recent sessions",
      recentSessionsDescription: "Jump straight into anything still active on the LAN.",
      open: "Open",
      noSessions: "No sessions yet. Head to the admin dashboard to create your first flight.",
      flowTitle: "Tonight's tasting flow",
      flowSteps: [
        "Guests join from their phones with a short code.",
        "The admin opens the lobby and advances each anonymous gin.",
        "Participants score flavor dimensions and overall impression.",
        "The room sees the reveal and shared radar charts at the end.",
      ],
      cards: [
        {
          title: "Room-scale syncing",
          description: "Stage changes broadcast instantly so everyone stays on the same gin.",
        },
        {
          title: "Flavor-first scoring",
          description: "Capture juniper, citrus, floral, spice, herbal, and sweetness in one card.",
        },
        {
          title: "Reveal-ready results",
          description: "Compare personal notes with group averages and spot the top pour.",
        },
      ],
    },
    join: {
      badge: "Join on mobile",
      title: "Enter the tasting room",
      description: "Use the short code from the host to jump straight into the live tasting screen.",
      openTasting: "Open tasting",
      codePlaceholder: "ABC123",
      invalidCode: "Enter a valid code to open the tasting.",
    },
    admin: {
      dashboardLabel: "Admin dashboard",
      createTitle: "Create the next tasting flight",
      createDescription:
        "Build a session, set an optional admin PIN, and jump straight into the live control room.",
      sessionsTitle: "Sessions",
      sessionsDescription:
        "Existing rooms stay here so you can re-open an active tasting quickly.",
      openControls: "Open controls",
      participantView: "Participant view",
      noSessions: "No sessions yet. Create one on the left and it will appear here.",
      sessionControlsLabel: "Admin controls",
      unlockTitle: "Unlock session controls",
      unlockDescription:
        "Enter the admin PIN for this room. The page stores it in a local browser cookie so you can keep conducting from the same device.",
      unlockButton: "Unlock",
      currentAction: "Current conductor action",
      liveStage: "Live stage",
      currentGin: "Current gin",
      guests: "Guests",
      updating: "Updating...",
      liveRoomLinks: "Live room links",
      participantScreen: "Participant screen",
      joinedParticipants: "Joined participants",
      noParticipants: "No participants yet.",
      flightLineup: "Flight lineup",
      participantRoom: "Participant room",
      scanToJoin: "Scan to join",
      deleteSession: "Delete tasting",
      deletingSession: "Deleting...",
      deleteSessionDescription:
        "Delete the whole tasting and all submitted cards. This cannot be undone.",
      deleteSessionConfirm:
        "Delete the tasting \"{sessionName}\"? This cannot be undone.",
      deleteSessionPinPrompt: "Enter the admin PIN to delete this tasting.",
      deleteSessionPinRequired: "Admin PIN is required to delete this tasting.",
      deleteSessionError: "Could not delete this tasting.",
      createForm: {
        sessionName: "Session name",
        sessionNamePlaceholder: "Friday gin flight",
        defaultSessionName: "Friday Gin Flight",
        tastingDate: "Tasting date",
        openDatePicker: "Open date picker",
        adminPin: "Admin PIN",
        adminPinPlaceholder: "Optional — auto-generated if left blank",
        lineupTitle: "Gin lineup",
        addGin: "Add gin",
        remove: "Remove",
        namePlaceholder: "Name",
        distilleryPlaceholder: "Distillery",
        abvPlaceholder: "ABV",
        descriptionPlaceholder: "Reveal notes and description",
        createButton: "Create tasting session",
        creatingButton: "Creating...",
        createError: "Could not create the tasting session.",
      },
    },
    session: {
      signedInAs: "Signed in as",
      cardsSubmitted: "cards submitted",
      lobbyEyebrow: "The room is assembling",
      lobbyTitle: "Sit tight, the first pour is almost ready.",
      lobbyDescription:
        "You'll stay on this screen while the host opens the lobby and starts the tasting. Your card will appear automatically as soon as the room moves forward.",
      revealTitle: "Reveal gin",
      yourCard: "Your card",
      overallScore: "Overall score",
    },
    participant: {
      joinSessionEyebrow: "Join {sessionName}",
      joinSessionTitle: "Add your tasting name",
      joinSessionDescription:
        "Once you join, this device stays linked to your tasting card for the rest of the session.",
      yourNamePlaceholder: "Your name",
      joining: "Joining...",
      joinButton: "Join tasting",
      joinError: "Could not join this session.",
      sessionClosedTitle: "This tasting is closed",
      sessionClosedDescription:
        "This session has already been completed and is no longer accepting new participants.",
      tastingCard: "Tasting card",
      anonymousPourDescription:
        "Score this pour while it's still anonymous. The reveal screen will fill in the bottle details after the host advances.",
      overallScoreDescription: "Use the full 1–10 range.",
      freeNotes: "Free notes",
      notesPlaceholder: "Martini-ready? Great neat? Too floral? Capture the moment.",
      saveButton: "Save tasting card",
      savingButton: "Saving...",
      saveLoaded: "Saved card loaded.",
      saveSuccess: "Card saved. You can keep adjusting it until the reveal.",
      saveError: "Could not save your tasting card.",
    },
    results: {
      reveal: "Results reveal",
      title: "Group flavor profile",
      topRated: "Top rated",
      roomConsensus: "Room consensus",
      youVsRoom: "You vs. the room",
      groupSeries: "Group",
      youSeries: "You",
      capturedAcross: "captured across",
    },
    flavors: {
      juniper: {
        label: "Juniper",
        hint: "Piney, resinous backbone and classic gin structure.",
      },
      citrus: {
        label: "Citrus",
        hint: "Lemon, grapefruit, sweet orange, or lime brightness.",
      },
      floral: {
        label: "Floral",
        hint: "Rose, lavender, violet, or other delicate aromatic lift.",
      },
      spice: {
        label: "Spice",
        hint: "Coriander, peppercorn, cardamom, cinnamon, or warming botanicals.",
      },
      herbal: {
        label: "Herbal",
        hint: "Rooty, earthy, green, rosemary, thyme, or angelica-like notes.",
      },
      sweetness: {
        label: "Sweetness",
        hint: "Perceived softness, rounded sugar note, or sweeter finish.",
      },
    },
    stages: {
      SETUP: "Setup",
      LOBBY: "Lobby",
      TASTING: "Tasting",
      REVEAL: "Reveal",
      RESULTS: "Results",
      COMPLETED: "Completed",
    },
    errors: {
      sessionNotFound: "Session not found.",
      invalidSessionPayload: "Invalid session payload.",
      invalidEventDate: "Invalid tasting date.",
      validParticipantName: "Please provide a valid participant name.",
      tastingSessionEnded: "This tasting session has already ended.",
      adminPinRequired: "Admin PIN is required.",
      invalidAdminPin: "Invalid admin PIN.",
      tastingCardMissingFields: "The tasting card is missing required fields.",
      participantSessionNotFound: "Participant session not found.",
      ginNotFoundForSession: "Gin not found for this session.",
      tastingNotOpen: "The tasting round is not open for new cards right now.",
      currentGinOnly: "You can only save notes for the currently active pour.",
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function getStageLabel(stage: SessionStage, dictionary: Messages) {
  return dictionary.stages[stage];
}

export function getAdvanceLabel(
  stage: SessionStage,
  currentGinIndex: number,
  ginCount: number,
  dictionary: Messages,
) {
  switch (stage) {
    case SessionStage.SETUP:
      return dictionary.stages.LOBBY;
    case SessionStage.LOBBY:
      return dictionary.stages.TASTING;
    case SessionStage.TASTING:
      return `${dictionary.session.revealTitle} ${currentGinIndex + 1}`;
    case SessionStage.REVEAL:
      return currentGinIndex < ginCount - 1
        ? `${dictionary.common.gin} ${currentGinIndex + 2}`
        : dictionary.stages.RESULTS;
    case SessionStage.RESULTS:
      return dictionary.stages.COMPLETED;
    case SessionStage.COMPLETED:
      return dictionary.stages.COMPLETED;
    default:
      return dictionary.stages.SETUP;
  }
}
