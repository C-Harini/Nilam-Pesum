# Scientific & Agronomic Assumptions (ASSUMPTIONS.md)
*Nilam Pesum (FieldVoice) — NASA Space Apps Challenge 2026*

This document provides transparent documentation of all mathematical, meteorological, and agronomic formulas, constants, and assumptions used across Nilam Pesum.

---

## 1. Growing Degree Days (GDD) Calculation

GDD represents the heat accumulation crops require to advance through developmental phenological stages.

### Modified 86/50 Method (Corn, Sorghum, Soybeans)
Following the standard NOAA / Iowa State University Extension methodology:

$$T_{adj\_max} = \min(\max(T_{max}, 50), 86)$$
$$T_{adj\_min} = \min(\max(T_{min}, 50), 86)$$
$$GDD = \frac{T_{adj\_max} + T_{adj\_min}}{2} - 50$$

- If $GDD < 0$, then $GDD = 0$.
- **Base Temperatures ($T_{base}$)**:
  - Corn: $50^\circ\text{F}$
  - Soybean: $50^\circ\text{F}$
  - Grain Sorghum: $50^\circ\text{F}$
  - Winter Wheat: $40^\circ\text{F}$
  - Oats: $42^\circ\text{F}$
  - Alfalfa: $41^\circ\text{F}$
  - Cereal Rye: $34^\circ\text{F}$
  - Crimson Clover: $40^\circ\text{F}$

---

## 2. Soil Bank (Nitrogen Ledger Accounting)

The Soil Bank tracks biological nitrogen credits (deposits) and crop nutrient uptake (withdrawals) in pounds of nitrogen per acre (lbs N/acre).

### Empirical Parameterization (USDA-NRCS & Land-Grant University Guidelines):
- **Corn (Grain)**: Withdraws approximately $0.90\text{ lbs N}$ per bushel. At a 185 bu/acre baseline yield, withdrawal is $-165\text{ lbs N/acre}$.
- **Soybeans (Legume)**: Synthesizes atmospheric nitrogen via *Bradyrhizobium japonicum* root nodules. While most is removed in seed grain, a net biological nitrogen credit of $+45\text{ lbs N/acre}$ remains available for the following crop.
- **Alfalfa (Perennial Legume)**: Extensive nodulation and taproot system; provides a first-year nitrogen credit of $+130\text{ lbs N/acre}$ upon termination.
- **Grain Sorghum**: Moderate consumer, with a net nitrogen withdrawal of $-100\text{ lbs N/acre}$.
- **Winter Wheat / Spring Oats**: Light to moderate consumers, withdrawing $-60\text{ lbs N/acre}$ and $-45\text{ lbs N/acre}$ respectively.
- **Cereal Rye (Cover Crop)**: Scavenger species; captures deep residual nitrate that would otherwise leach into groundwater, releasing $+25\text{ lbs N/acre}$ as it decomposes.
- **Crimson Clover (Cover Legume)**: Rapid vegetative growth fixing $+85\text{ lbs N/acre}$ of organic nitrogen ahead of spring planting.

---

## 3. Crop Rotation 5-Factor Scoring Model

Every evaluated 3-season rotation receives five independent, transparent sub-scores ranging from 0 to 100:

1. **Yield Score ($S_{yield}$)**:
   Measures historical yield stability and agronomic yield synergy (e.g., corn following soybeans yields 8-15% higher than continuous corn due to reduced pest pressure and improved seedbed tilth).

2. **Water Score ($S_{water}$)**:
   Compares the cumulative seasonal water demand of the rotation against the field's Available Water Capacity (AWC) and historical NASA POWER rainfall/root-zone moisture.
   $$S_{water} = 100 - 15 \times \max\left(0, \frac{\text{WaterDeficit}}{\text{WaterReq}}\right) \times 100$$

3. **Soil Score ($S_{soil}$)**:
   Evaluates organic matter maintenance, erosion prevention index (days of living ground cover per year), and the 3-year net Nitrogen Bank balance:
   $$S_{soil} = \text{clamp}(50 + 0.25 \times \Delta N_{3yr} + 20 \times \text{CoverCropBonus}, 0, 100)$$

4. **Income Score ($S_{income}$)**:
   Calculates expected net gross margin per acre across the 3 seasons:
   $$\text{NetMargin} = \sum_{i=1}^3 (\text{Yield}_i \times \text{Price}_i - \text{InputCost}_i)$$
   Normalized against the regional maximum expected gross margin.

5. **Risk Score ($S_{risk}$)**:
   Measures resilience against catastrophic climate extremes (e.g., heat stress during flowering, summer drought) and pest cycle diversity. Rotations with multiple distinct botanical families (grass, legume, cover) score highest (85-98), whereas continuous mono-cropping scores lowest (20-35).

### Priority Double-Weighting
When a farmer selects one or more strategic priorities:
- Default factor weights: $w_k = 1.0$ for $k \in \{\text{Yield}, \text{Water}, \text{Soil}, \text{Income}, \text{Risk}\}$
- For each priority matched (e.g., "Save water" $\rightarrow$ Water, "Protect my soil" $\rightarrow$ Soil, "Earn more" $\rightarrow$ Income, "Lower my risk" $\rightarrow$ Risk), its weight is doubled: $w_{matched} = 2.0$.
- Composite Overall Score:
  $$\text{Score}_{total} = \frac{\sum_{k} w_k \cdot S_k}{\sum_{k} w_k}$$

---

## 4. Agro-Meteorological Alert Rules

Thresholds are calculated using daily NASA POWER measurements:
1. **Dry Spell Alert**:
   - Condition: Cumulative precipitation $< 0.25\text{ inches}$ over the preceding 14 consecutive days **AND** root-zone soil wetness (`GWETROOT`) $< 0.30$ (less than 30% field saturation).
2. **Heat Stress Alert**:
   - Condition: Daily maximum temperature $T_{max} \ge 95^\circ\text{F}$ for 3 or more days within any crop's designated critical pollination/flowering window.
3. **Heavy Rain / Field Delay Alert**:
   - Condition: 24-hour precipitation $> 2.0\text{ inches}$ ($50.8\text{ mm}$), signalling severe topsoil erosion risk, nutrient leaching, and machinery impassability.

---

## 5. Satellite Earth Observation Scope & Boundaries

- **NDVI Interpretation**: MODIS NDVI measures vegetative greenness and canopy photosynthetic density. It is **not** a direct sensor of crop pathology, bacterial blight, or grain species identification. High NDVI indicates vigorous vegetative canopy; low NDVI reflects dormancy, post-harvest residue, or severe moisture/heat stress.
- **Spatial Resolution Boundary**: NASA POWER data represents a $0.5^\circ \times 0.625^\circ$ grid cell. Local microclimates or tile-drained farm sub-fields may exhibit local variance.
