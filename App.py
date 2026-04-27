import streamlit as st
import pandas as pd

# Configurazione estetica
st.set_page_config(page_title="Registro Cucina", layout="centered")

st.markdown("""
    <style>
    .main { background-color: #f5f5f5; }
    .stButton>button { width: 100%; border-radius: 5px; height: 3em; background-color: #2e7d32; color: white; }
    </style>
    """, unsafe_allow_html=True)

st.title("👨‍🍳 Registro Preparazioni v1.0")

# Database integrato nell'app
if 'data' not in st.session_state:
    st.session_state.data = {
        "LUNEDÌ / GIOVEDÌ": [
            {"Alimento": "Fiori di zucca", "In Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "In Linea": "1 gn 1/3", "Scorta": "2"},
            {"Alimento": "Zucchine al forno", "In Linea": "1 gn 1/6", "Scorta": "2"},
            {"Alimento": "Melanzane al forno", "In Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Peperoni al forno", "In Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Funghi affettati", "In Linea": "1 gn 1/1", "Scorta": "3"},
            {"Alimento": "Salsiccia", "In Linea": "gn 1/3", "Scorta": "1"},
            {"Alimento": "Mozzarella julienne", "In Linea": "gn 1/1", "Scorta": "40 KG"},
            {"Alimento": "Sugo", "In Linea": "1 gn 1/1", "Scorta": "3"}
        ],
        "VENERDÌ": [
            {"Alimento": "Fiori di zucca", "In Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Rughetta", "In Linea": "1 gn 1/3", "Scorta": "3 etti"},
            {"Alimento": "Mozz. no lattosio", "In Linea": "1 gn 1/3", "Scorta": "1,5 kg"},
            {"Alimento": "Pecorino gratt.", "In Linea": "gn 1/6", "Scorta": "1 kg"},
            {"Alimento": "Mozzarella julienne", "In Linea": "gn 1/1", "Scorta": "60 KG"}
        ],
        "SABATO / DOMENICA": [
            {"Alimento": "Fiori di zucca", "In Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "In Linea": "1 gn 1/3", "Scorta": "3"},
            {"Alimento": "Funghi affettati", "In Linea": "1 gn 1/1", "Scorta": "4"},
            {"Alimento": "Prosciutto crudo", "In Linea": "1 gn 1/3", "Scorta": "3"},
            {"Alimento": "Mozzarella julienne", "In Linea": "gn 1/1", "Scorta": "120 KG"},
            {"Alimento": "Sugo", "In Linea": "1 gn 1/1", "Scorta": "4"}
        ],
        "MAGAZZINO": [
            {"Alimento": "Carciofi/Olive/Alici", "Regola": "Appena aperto"},
            {"Alimento": "Olio EVO", "Regola": "Sotto 2lt"},
            {"Alimento": "Olio di semi", "Regola": "Sotto 5lt"},
            {"Alimento": "Sale/Pepe/Origano", "Regola": "Sotto 2kg"},
            {"Alimento": "Mozz. no lattosio", "Regola": "Appena aperta"}
        ]
    }
    # Aggiungi colonna Fatto e Note a tutti
    for day in st.session_state.data:
        for item in st.session_state.data[day]:
            item["✓"] = False
            item["Note"] = ""

# Interfaccia
tab_nomi = list(st.session_state.data.keys())
scelta = st.radio("Seleziona il Registro:", tab_nomi, horizontal=True)

st.subheader(f"Lista per {scelta}")

# Editor Tabella
df = pd.DataFrame(st.session_state.data[scelta])
edited_df = st.data_editor(
    df,
    column_config={
        "✓": st.column_config.CheckboxColumn("Fatto", default=False),
        "Note": st.column_config.TextColumn("Note (es. mancanze)", width="large")
    },
    disabled=["Alimento", "In Linea", "Scorta", "Regola"],
    hide_index=True,
    use_container_width=True,
    key=f"editor_{scelta}"
)

# Pulsante di salvataggio
if st.button("✅ CONFERMA E SALVA"):
    st.session_state.data[scelta] = edited_df.to_dict('records')
    st.balloons()
    st.success("Ottimo! I dati sono stati aggiornati.")

st.markdown("---")
if st.button("🗑️ AZZERA TUTTO (Reset Giornaliero)"):
    st.session_state.clear()
    st.rerun()
