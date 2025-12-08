<a id="top"></a>

# PetCare

System do zarządzania wizytami u weterynarza i profilami zwierząt.

- Autorzy: 
  - Witold Zawada,
  - Wiktor Wypyszyński
- Stos technologiczny: Spring Boot, Spring Security, JPA, Flyway, React (Vite), JWT, Java 21, JDK 21

---

## Spis treści
1. [Opis, architektura i uruchomienie](#opis-architektura-i-uruchomienie)
2. [Technologie](#technologie)
3. [REST API oraz serializacja danych](#rest-api-oraz-serializacja-danych)
4. [Zasady SOLID i czysty kod](#zasady-solid-i-czysty-kod)
5. [Testy](#testy)
6. [Docker](#docker)
7. [Harmonogram rozwoju](#harmonogram-rozwoju)

---

## Opis, architektura i uruchomienie

PetCare to aplikacja webowa w architekturze klient-serwer. 
Umożliwia rejestrację/logowanie, zarządzanie zwierzętami 
i umawianie wizyt do weterynarza z walidacją konfliktów 
oraz czasu.

- **Architektura:**
  - **Klient: React (Vite)**, komunikacja z REST API przez fetch.
  - **Serwer:** Spring Boot (kontrolery, serwisy domenowe, repozytoria JPA).
  - **Baza danych:** H2 (dev) / Postgres (prod) z migracjami Flyway.

- **Role i uprawnienia:**
  - **USER** – właściciel zwierząt; zarządza swoimi zwierzętami, umawia się na wizyty,
  ma wgląd do swoich wizyt i historii medycznej swoich zwierząt.
  - **VET** – weterynarz; zarządza swoim profilem weterynarza, tygodniowym harmonogramem,
  urlopem, przegląda i aktualizuje wizyty oraz historię medyczną swoich pacjentów.
  - **ADMIN** – administrator; zarządza wszystkimi encjami systemu.

- **Moduły funkcjonalne:**
  - Status aplikacji, Autentykacja i autoryzacja (JWT), 
  Użytkownicy, Zwierzęta, Wizyty, Weterynarze, Historia medyczna.

- **Konta testowe:**
  - admin/admin12345678, vet/vet12345678, user/user12345678

- **Wymagania systemowe:**
  - JDK v21, Java v21, Node.js v24+ (frontend), Docker i Docker Compose (opcjonalnie)

### Uruchomienie

- **Development:**
  - **Backend:**: Odpalić projekt w IntelliJ IDEA - ``PetcareApplication``.
  - **Frontend:**
    ```bash
    cd src/main/client
    pnpm install
    pnpm dev
    ```
  - **Adresy:**
    - API: http://localhost:8080
    - Swagger UI: http://localhost:8080/swagger-ui/index.html
    - Frontend: http://localhost:5173
- **Produkcja:**
    ```bash
    docker compose up -d
    ```
<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Technologie

- Spring Boot v3.5.6, Spring Security
- JPA/Hibernate, Flyway, H2/PostgreSQL
- JWT (jjwt)
- React (Vite)
- Docker
- Springdoc OpenAPI (Swagger UI)

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## REST API oraz serializacja danych

Wszystkie endpointy mają prefiks `/api`. Dokumentacja OpenAPI jest dostępna w Swagger UI: `http://localhost:8080/swagger-ui/index.html`.

- **Status (`/status`):** sprawdzenie zdrowia aplikacji.
- **Auth (`/auth`):** rejestracja, logowanie, bieżący użytkownik.
- **Users (`/users`):** zarządzanie użytkownikami.
- **Pets (`/pets`):** zarządzanie profilami zwierząt.
- **Vets (`/vets`):** zarządzanie profilami weterynarzy, harmonogramem i urlopami.
- **Visits (`/visits`):** zarządzanie wizytami (slots, konflikty, time-off).
- **Medical Records (`/medical-records`):** zarządzanie historią medyczną.

**Serializacja danych:**

- **Endpointy:** 
  - `POST /api/pets/me/export`, 
  - `GET /api/pets/me/import`.
- Frontend: `PetImportExportPanel.tsx` – eksport (plik `pets-export-YYYY-MM-DD.json`), import (walidacja, limit 1 MB, drag & drop).

Przykładowy plik:
```json
[
  {
    "name": "Sara",
    "species": "DOG",
    "sex": "FEMALE",
    "breed": "Crossbreed",
    "birthDate": "2021-05-10",
    "birthYear": 2021,
    "weight": 9.5,
    "notes": "Very friendly and loves kids."
  },
  {
    "name": "Yuki",
    "species": "CAT",
    "sex": "FEMALE",
    "breed": "European Shorthair",
    "birthDate": "2022-05-10",
    "birthYear": 2022,
    "weight": 3.8,
    "notes": "Timid and afraid of vaccinations."
  }
]
```

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Zasady SOLID i czysty kod

**SOLID**

- **SRP – pojedyncza odpowiedzialność:**
  - `VisitServiceImpl`: wyłącznie logika wizyt (walidacje czasu, konflikty, tworzenie encji).
  - `MedicalRecordServiceImpl`: tworzenie/aktualizacja rekordów medycznych.
  - `GlobalExceptionHandler`: konwersja wyjątków → spójne odpowiedzi HTTP.

- **OCP – otwarte na rozszerzenia, zamknięte na modyfikacje:**
  - Dodanie nowego statusu/zasady to dopisanie walidacji/wyjątku bez zmiany interfejsów.

- **LSP – podstawianie zgodne z zasadą:**
  - Implementacje serwisów można podmieniać przez interfejsy bez zmiany zachowania (np. `PetServiceImpl` ← `PetService`, `VisitServiceImpl` ← `VisitService`).

- **ISP – rozdzielone, małe interfejsy:**
  - Interfejsy są wyspecjalizowane i nie wymuszają zbędnych metod (np. `VetScheduleService`, `VetTimeOffService`, `PetAccessService`).

- **DIP – odwrócenie zależności:**
  - Moduły wysokiego poziomu zależą od abstrakcji, nie implementacji (np. kontrolery wstrzykują serwisy; serwisy wstrzykują repozytoria JPA/interfejsy).

**Czysty kod – wybrane zasady:**
  - Nazwy metod: czasownik + obiekt (`createVisit`, `updateVisitStatus`).
  - Prywatne helpery redukują duplikacje (np. `validateTemporal`, `assertCanModifyForVet`).
  - Spójne wyjątki domenowe: `MedicalRecordStatusNotAllowedException`, `DuplicateMedicalRecordException`.
  - Krótkie klasy i czytelne odpowiedzialności, indeksy w encjach (np. `Visit`).

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Testy

Zakres testowania obejmuje poziomy jednostkowe i integracyjne.

- **Strategia:**
  - **Jednostkowe:** logika domenowa (walidacje czasu, konflikty slotów, statusy rekordów).
  - **Integracyjne (MockMvc):** statusy HTTP, kontrakty JSON, autoryzacja.

- **Uruchamianie testów:** Odpalić projekt w IntelliJ IDEA - ``Tests in 'petcare.test'``.
  Raport HTML: `build/reports/tests/test/index.html`

- **Przykładowe obszary pokrycia:**
  - `VisitServiceImplTest`: data w przeszłości, slot zajęty, day-off, startTime dziś < teraz.
  - `MedicalRecordServiceImplTest`: status wizyty niedozwolony, duplikat rekordu.

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Docker

Obraz Dockera dla aplikacji backendowej PetCare jest zoptymalizowany pod kątem bezpieczeństwa, wydajności i łatwości utrzymania. 

Poniżej znajdują się kluczowe cechy i uzasadnienia zastosowanych rozwiązań:
  - **Multi-stage build:** frontend budowany w oddzielnym etapie; finalny obraz zawiera tylko JRE i artefakt.
  - **Minimalny runtime:** `eclipse-temurin:21-jre-alpine` (brak narzędzi buildowych), szybki start i niski narzut rozmiaru; łatwe, szybkie aktualizacje bazowego JRE.
  - **Least privilege:** uruchamianie jako nie-root (`USER app`) – zgodnie z zasadami bezpieczeństwa kontenerów.
  - **Healthcheck:** wbudowany `HEALTHCHECK` na `/api/status/health`.
  - **Zmienne środowiskowe:** konfiguracja przez zmienne środowiskowe; SEKRETY należy podawać w runtime (env/secrets), nie zapisywać w obrazie.

Uruchomienie środowiska (API + Postgres):
```bash
docker compose up -d
```


<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Harmonogram rozwoju

| Etap | Zakres                                                     | Status      |
|------|------------------------------------------------------------|-------------|
| 1    | Inicjalizacja projektu (Gradle, Spring Boot)               | Zakończone  |
| 2    | Konfiguracja bazy danych + migracje Flyway                 | Zakończone  |
| 3    | Endpoint status/health                                     | Zakończone  |
| 4    | Modele domenowe i encje: User, Pet                         | Zakończone  |
| 5    | Uwierzytelnianie JWT + role (Spring Security)              | Zakończone  |
| 6    | Globalny handler wyjątków (spójne odpowiedzi HTTP)         | Zakończone  |
| 7    | Dokumentacja Swagger/OpenAPI                               | Zakończone  |
| 8    | API użytkowników i zwierząt (Users, Pets)                  | Zakończone  |
| 9    | Profile weterynarzy (VetProfile)                           | Zakończone  |
| 10   | Harmonogram pracy weterynarzy (VetSchedule)                | Zakończone  |
| 11   | Urlopy weterynarzy (VetTimeOff)                            | Zakończone  |
| 12   | Wizyty (Visits): walidacje czasu, konflikty, time-off      | Zakończone  |
| 13   | Rekordy medyczne (Medical Records)                         | Zakończone  |
| 14   | Import/Export JSON zwierząt + panel frontend (drag & drop) | Zakończone  |
| 15   | Frontend React: routing, integracja widoków (/pets)        | Zakończone  |
| 16   | Obraz Docker (multi-stage, non-root, healthcheck)          | Zakończone  |
| 17   | Testy jednostkowe i integracyjne                           | Zakończone  |
| 18   | Uporządkowana dokumentacja README                          | Zakończone  |

<p align="right">(<a href="#top">przewiń do góry</a>)</p>