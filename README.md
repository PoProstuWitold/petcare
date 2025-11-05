# [PL] PetCare
## System do zarządzania wizytami u weterynarza i profilami zwierząt.

**Autor:** Witold Zawada (indywidualny projekt)
**Technologia:** Spring Boot + Spring Security + Thymeleaf + H2 (Flyway)  
**Wersja Java oraz JDK:** 21

---

## Spis treści
1. [Opis projektu](#opis-projektu)
2. [Architektura](#architektura)
3. [Funkcjonalności](#funkcjonalnosci)
    - [Role](#role)
    - [Moduły aplikacji](#moduly-aplikacji)
4. [Zasady SOLID](#zasady-solid)
5. [Testy](#testy)
6. [Technologie i narzędzia](#technologie-i-narzedzia)
7. [REST API](#rest-api)
---

## Opis projektu

**PetCare** to aplikacja webowa w architekturze **klient–serwer**, której celem jest zarządzanie zwierzętami, ich profilami oraz wizytami u weterynarza. System umożliwia logowanie, przeglądanie oraz zarządzanie danymi przez różne role użytkowników (`USER`, `VET`, `ADMIN`).

---

## Architektura

Aplikacja została stworzona w modelu **klient–serwer**:
- **Klient:** przeglądarka internetowa (wysyła żądania HTTP do serwera)
- **Serwer:** aplikacja Spring Boot (renderuje strony HTML za pomocą silnika Thymeleaf)
- **Baza danych:** H2 (z migracjami Flyway)

Dodatkowo udostępniane są dane poprzez **REST API**, np. `/api/pets`.

---

## Funkcjonalności

### Role
- `USER` – właściciel zwierząt, może przeglądać i dodawać swoje zwierzaki oraz wizyty.
- `VET` – weterynarz (pełni też rolę recepcjonisty), widzi wszystkie zwierzęta, wizyty i ich historię.
- `ADMIN` – administrator systemu, zarządza użytkownikami i danymi.

### Moduły aplikacji

**java:**
- **config**
- **pet**
- **security**
- **status**
- **user**
- **web**

**resources:**
- **db.migration**
- **public**
- **templates**
- **application.yml**
---

## Zasady SOLID

DO ZROBIENIA

---

## Testy

DO ZROBIENIA

---

## Technologie i narzędzia

- **Spring Boot 3.5.6**
- **Spring Security**
- **Thymeleaf**
- **JPA**
- **Flyway (migracje)**
- **H2 Database**
- **Docker (opcjonalnie)**

---

## REST API

DO ZROBIENIA