import random
import requests
import time
import matplotlib.pyplot as plt

url_endpoint = 'http://localhost:3000/asignatura/'

def random_id_entropy():

    # Leverage system randomness using random.SystemRandom
    random_source = random.SystemRandom()

    # Generate a random float between 0.0 (inclusive) and 1.0 (exclusive)
    random_float = random_source.random()

    # Scale the random float to the desired range [1, 8349]
    number = int(random_float * 69688) + 1

    return number

def realizar_consulta_get(id_asignatura):
    try:
        start_time = time.time()  # Comienza a medir el tiempo
        respuesta = requests.get(f"{url_endpoint}{id_asignatura}")
        end_time = time.time()  # Termina de medir el tiempo
        elapsed_time = end_time - start_time  # Calcula el tiempo transcurrido
        
        if respuesta.status_code == 200:
            datos = respuesta.json()
            print(f"Datos de la asignatura con ID {id_asignatura}:")
            for clave, valor in datos.items():
                print(f"  - {clave}: {valor}")
            print(f"Tiempo de respuesta: {elapsed_time:} segundos")
        else:
            print(f"Error al realizar la consulta para ID {id_asignatura}: {respuesta.status_code}")
        return elapsed_time
    except Exception as error:
        print(f"Error inesperado al realizar la consulta para ID {id_asignatura}: {error}")
        return None  # En caso de error, retorna None para no considerarlo en el promedio

def main():
    print("\033[91mEntropy test\033[0m")

    cantidad_consultas = int(input("¿Cuántas consultas aleatorias desea realizar? "))
    registro_consultas = {}
    tiempos_respuesta = []  # Lista para guardar los tiempos de respuesta

    for _ in range(cantidad_consultas):
        id_asignatura_aleatorio = random_id_entropy()
        if id_asignatura_aleatorio in registro_consultas:
            registro_consultas[id_asignatura_aleatorio] += 1
        else:
            registro_consultas[id_asignatura_aleatorio] = 1
        tiempo = realizar_consulta_get(id_asignatura_aleatorio)
        if tiempo is not None:
            tiempos_respuesta.append(tiempo)
            
    if tiempos_respuesta:
        promedio_tiempos = sum(tiempos_respuesta) / len(tiempos_respuesta)
        print(f"\nPromedio de tiempo de respuesta: {promedio_tiempos:} segundos")
    else:
        print("\nNo se registraron tiempos de respuesta válidos.")
    
    # Gráfico de la cantidad de consultas por ID de asignatura
    plt.figure(figsize=(14, 7))
    
    # Subplot para la cantidad de consultas
    plt.subplot(1, 2, 1)
    ids = list(registro_consultas.keys())
    counts = list(registro_consultas.values())
    plt.bar(ids, counts, color='blue')
    plt.xlabel('ID de la Asignatura')
    plt.ylabel('Cantidad de Consultas')
    plt.title('Cantidad de Consultas por ID de Asignatura')
    
    # Subplot para el tiempo de respuesta
    plt.subplot(1, 2, 2)
    plt.plot(tiempos_respuesta, marker='o', linestyle='-', color='b')
    plt.title('Tiempo de Respuesta para Cada Consulta')
    plt.xlabel('Número de Consulta')
    plt.ylabel('Tiempo de Respuesta (segundos)')
    plt.grid(True)
    
    # Mostrar y guardar los gráficos
    filename = input("\033[91mIngrese el nombre del archivo para guardar los gráficos de entropía (incluya la extensión, ej. graficos.png): \033[0m")
    plt.tight_layout()
    plt.savefig(filename)
    print(f"Gráficos guardados como {filename}")

if __name__ == "__main__":
    main()