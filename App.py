import streamlit as st
import pandas as pd

st.set_page_config(page_title="Registro Cucina", layout="centered")
st.title("👨‍🍳 Registro Preparazioni")

if 'data' not in st.session_state:
    st.session_state.data = {
        "LUN-GIO": [
            {"Alimento": "Fiori di zucca", "In Linea": "1 gn 1/3", "Scorta": "1", "✓": False},
            {"Alimento": "Patate al forno", "In Linea": "1 gn 1/3", "Scorta": "2", "✓": False},
            {"Alimento": "Zucchine", "In Linea": "1 gn 1/6", "Scorta": "2", "✓": False},
            {"Alimento": "Mozzarella", "In Linea": "gn 1/1", "Scorta": "40 KG", "✓": False},
            {"Alimento": "Sugo", "In Linea": "1 gn 1/1", "Scorta": "3", "✓": False},
        ],
        "VENERDÌ": [
            {"Alimento": "Rughetta", "In Linea": "1 gn 1/3", "Scorta": "3 etti", "✓": False},
            {"Alimento": "Mozz. no lattosio", "In Linea": "1 gn 1/3", "Scorta": "1,5 kg", "✓": False},
            {"Alimento": "Mozzarella", "In Linea": "gn 1/1", "Scorta": "60 KG", "✓": False},
        ],
        "SAB-DOM": [
            {"Alimento": "Patate al forno", "In Linea": "1 gn 1/3", "Scorta": "3", "✓": False},
            {"Alimento": "Funghi", "In Linea": "1 gn 1/1", "Scorta": "4", "✓": False},
            {"Alimento": "Mozzarella", "In Linea": "gn 1/1", "Scorta": "120 KG", "✓": False},
        ],
        "MAGAZZINO": [
            {"Alimento": "Olio EVO", "Regola": "Sotto 2lt", "✓": False},
            {"Alimento": "Sale/Pepe", "Regola": "Sotto 2kg", "✓": False},
            {"Alimento": "Carciofi/Olive", "Regola": "Appena aperto", "✓": False},
        ]
    }

scelta = st.selectbox("Seleziona Tabella", list(st.session_state.data.keys()))

df = pd.DataFrame(st.session_state.data[scelta])
edited_df = st.data_editor(
    df, 
    column_config={"✓": st.column_config.CheckboxColumn("✓", default=False)},
    disabled=["Alimento", "In Linea", "Scorta", "Regola"],
    hide_index=True,
    use_container_width=True
)

if st.button("💾 Salva/Aggiorna"):
    st.session_state.data[scelta] = edited_df.to_dict('records')
    st.success("Dati aggiornati per tutto lo staff!")

if st.button("🗑️ Reset Giornaliero"):
    st.session_state.clear()
    st.rerun()
