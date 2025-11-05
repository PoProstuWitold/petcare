<a id="top"></a>

# [PL] PetCare
## System do zarządzania wizytami u weterynarza i profilami zwierząt.

**Autor:** Witold Zawada (indywidualny projekt)
**Technologia:** Spring Boot + Spring Security + Thymeleaf + H2 (Flyway)  
**Wersja Java oraz JDK:** 21

---

## Spis treści
1. [Opis projektu](#opis-projektu)
2. [Architektura](#architektura)
3. [Aplikacja](#aplikacja)
4. [Zasady SOLID](#zasady-solid)
5. [Testy](#testy)
6. [Technologie](#technologie)
7. [REST API](#rest-api)

---

## Opis projektu

**PetCare** to aplikacja webowa w architekturze **klient–serwer**, której celem jest zarządzanie zwierzętami, ich profilami oraz wizytami u weterynarza. System umożliwia logowanie, przeglądanie oraz zarządzanie danymi przez różne role użytkowników (`USER`, `VET`, `ADMIN`).

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Architektura

Aplikacja została stworzona w modelu **klient–serwer**:
- **Klient:** przeglądarka internetowa (wysyła żądania HTTP do serwera)
- **Serwer:** aplikacja Spring Boot (renderuje strony HTML za pomocą silnika Thymeleaf)
- **Baza danych:** H2 (z migracjami Flyway)

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Aplikacja

### Role
- `USER` – właściciel zwierząt, może przeglądać i dodawać swoje zwierzaki oraz wizyty.
- `VET` – weterynarz (pełni też rolę recepcjonisty), widzi wszystkie zwierzęta, wizyty i ich historię.
- `ADMIN` – administrator systemu, zarządza użytkownikami i danymi.

### Moduły

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

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Zasady SOLID

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Testy

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Technologie

- **Spring Boot 3.5.6**
- **Spring Security**
- **Thymeleaf**
- **JPA**
- **Flyway (migracje)**
- **H2 Database**
- **Docker (opcjonalnie)**

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## REST API

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>