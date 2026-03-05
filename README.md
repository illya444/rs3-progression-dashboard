# RS3 Progression Intelligence System

A strategic RuneScape 3 progression engine that converts player data,
game knowledge, and economic information into prioritized gameplay
recommendations.

This project guides accounts through the progression path:

New Account
→ Quest Cape
→ Invention Infrastructure
→ PvM Engine
→ Max Cape
→ Completionist
→ Trimmed Completionist

## Core Doctrine

Structure > Speed
Permanent Unlocks > XP Efficiency
No Random Progression
No Backtracking

## System Purpose

The system answers:

What should this account do next?

## Architecture Overview

External APIs
    RuneMetrics
    RuneScape Wiki
    WeirdGloop

↓

Connector Layer

↓

Normalization Layer

↓

Cache Layer

↓

Decision Engine

↓

Web Dashboard

## Repository Structure

Documented layout:

apps/
  api/
  web/

packages/
  connectors/
  core/

data/

docs/

## Example Output

1 Complete Sliske's Endgame
2 Train Herblore to 90
3 Buy Travelling Merchant Item
4 Train Invention to 80
5 Start River of Blood
