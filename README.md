<a id="top"></a>

# PetCare

System do zarządzania wizytami u weterynarza i profilami zwierząt.

- Autor: Witold Zawada (projekt indywidualny)
- Stos technologiczny: Spring Boot, Spring Security, JPA, Flyway, React (Vite), JWT
- Wersja JDK: 21

---

## Spis treści
1. [Opis, architektura i uruchomienie](#opis-architektura-i-uruchomienie)
2. [REST API](#rest-api)
3. [Testy](#testy)
4. [Zasady SOLID i czysty kod](#zasady-solid-i-czysty-kod)
5. [Technologie](#technologie)
6. [Docker](#docker)
7. [Import / Export JSON](#import--export-json)
8. [Harmonogram rozwoju](#harmonogram-rozwoju)

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
  - **USER** – właściciel zwierząt; zarządza swoimi danymi i wizytami.
  - **VET** – weterynarz; widzi wszystkie zwierzęta i wizyty, zarządza grafikiem.
  - **ADMIN** – administrator; pełne uprawnienia administracyjne.

- **Moduły funkcjonalne:**
  - Status aplikacji, Autentykacja i autoryzacja (JWT), Użytkownicy, Zwierzęta, Wizyty, Historia medyczna (w toku).

- **Konta testowe (dev):**
  - admin/admin12345678, vet/vet12345678, user/user12345678

- **Wymagania systemowe:**
  - JDK v21, Java v21, Node.js v24+ (frontend), Docker i Docker Compose (opcjonalnie)

## Uruchomienie

- **Development:**
  - **Backend:**
    ```bash
    ./gradlew clean bootRun
    ```
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

## REST API

Wszystkie endpointy mają prefiks `/api`. Dokumentacja OpenAPI jest dostępna w Swagger UI: `http://localhost:8080/swagger-ui/index.html`.

- **Status (`/status`):** sprawdzenie zdrowia aplikacji.
- **Auth (`/auth`):** rejestracja, logowanie, bieżący użytkownik.
- **Users (`/users`):** zarządzanie użytkownikami.
- **Pets (`/pets`):** zarządzanie profilami zwierząt.
- **Visits (`/visits`):** zarządzanie wizytami (slots, konflikty, time-off).
- **Medical Records (`/medical-records`):** (w toku) zarządzanie historią medyczną.

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Testy

Zakres testowania obejmuje poziomy jednostkowe i integracyjne.

- **Strategia:**
  - **Jednostkowe:** logika domenowa (walidacje czasu, konflikty slotów, statusy rekordów).
  - **Integracyjne (MockMvc):** statusy HTTP, kontrakty JSON, autoryzacja.

- **Uruchamianie testów:**
  ```bash
  ./gradlew test
  ```
  Raport HTML: `build/reports/tests/test/index.html`

- **Przykładowe obszary pokrycia:**
  - `VisitServiceImplTest`: data w przeszłości, slot zajęty, day-off, startTime dziś < teraz.
  - `MedicalRecordServiceImplTest`: status wizyty niedozwolony, duplikat rekordu.

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Zasady SOLID i czysty kod

- **SRP – pojedyncza odpowiedzialność:**
  - `VisitServiceImpl`: wyłącznie logika wizyt (walidacje czasu, konflikty, tworzenie encji).
  - `MedicalRecordServiceImpl`: tworzenie/aktualizacja rekordów medycznych.
  - `GlobalExceptionHandler`: konwersja wyjątków → spójne odpowiedzi HTTP.

- **OCP – otwarte na rozszerzenia, zamknięte na modyfikacje:**
  - Dodanie nowego statusu/zasady to dopisanie walidacji/wyjątku bez zmiany interfejsów.

- **LSP** – implementacje serwisów są wymienialne przez interfejsy (`PetService`, `VisitService`, ...).

- **ISP** – wyspecjalizowane interfejsy (`VetScheduleService`, `VetTimeOffService`) bez zbędnych metod.

- **DIP** – kontrolery zależą od abstrakcji serwisów, serwisy od repozytoriów JPA.

- **Czysty kod – wybrane zasady:**
  - Nazwy metod: czasownik + obiekt (`createVisit`, `updateVisitStatus`).
  - Prywatne helpery redukują duplikacje (np. `validateTemporal`, `assertCanModifyForVet`).
  - Spójne wyjątki domenowe: `MedicalRecordStatusNotAllowedException`, `DuplicateMedicalRecordException`.
  - Krótkie klasy i czytelne odpowiedzialności, indeksy w encjach (np. `Visit`).

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

## Docker

Budowa obrazu backendu:
```bash
docker build -t petcare:latest .
```
Uruchomienie środowiska (API + Postgres):
```bash
docker compose up -d
```

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Import / Export JSON

- **Endpointy:** 
  - `POST /api/pets/me/export`, 
  - `GET /api/pets/me/import`.
- Frontend: `PetImportExportPanel` – eksport (plik `pets-export-YYYY-MM-DD.json`), import (walidacja, limit 1 MB, drag & drop).

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

## Harmonogram rozwoju

| Etap | Zakres                      | Status |
|------|-----------------------------|--------|
| 1 | Użytkownicy i zwierzęta     | Zakończone |
| 2 | JWT + role                  | Zakończone |
| 3 | Weterynarze i wizyty        | Zakończone |
| 3 | Import/Export JSON zwierząt | Zakończone |
| 4 | Rekordy medyczne            | Zakończone |
| 4 | Obraz Dockera               | Zakończone |
| 5 | Testy                       | Zakończone |

<p align="right">(<a href="#top">przewiń do góry</a>)</p>