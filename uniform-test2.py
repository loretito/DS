import random
import requests
import time
import matplotlib.pyplot as plt

url_endpoint = 'http://localhost:3000/asignatura/'

def random_id_entropy():
    random_source = random.SystemRandom()
    random_float = random_source.random()
    number = int(random_float * 8000) + 1
    return number

def realizar_consulta_get(id_asignatura):
    try:
        start_time = time.time()
        respuesta = requests.get(f"{url_endpoint}{id_asignatura}")
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        if respuesta.status_code == 200:
            datos = respuesta.json()
            print(f"Datos de la asignatura con ID {id_asignatura}:")
            for clave, valor in datos.items():
                print(f"  - {clave}: {valor}")
            print(f"Tiempo de respuesta: {elapsed_time:.3f} segundos")
        else:
            print(f"Error al realizar la consulta para ID {id_asignatura}: {respuesta.status_code}")
        return elapsed_time
    except Exception as error:
        print(f"Error inesperado al realizar la consulta para ID {id_asignatura}: {error}")
        return None

def main():
    print("\033[91mEntropy test\033[0m")
    cantidad_consultas = int(input("¿Cuántas consultas aleatorias desea realizar? "))
    registro_consultas = {}
    tiempos_respuesta = []

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
        print(f"\nPromedio de tiempo de respuesta: {promedio_tiempos:.3f} segundos")
    else:
        print("\nNo se registraron tiempos de respuesta válidos.")
    
    # Gráfico de la cantidad de consultas por ID de asignatura
    plt.figure(figsize=(19.2, 10.8))
    ids = list(registro_consultas.keys())
    counts = list(registro_consultas.values())
    plt.bar(ids, counts, color='blue')
    plt.xlabel('ID de la Asignatura')
    plt.ylabel('Cantidad de Consultas')
    plt.title('Cantidad de Consultas por ID de Asignatura')
    filename1 = input("\033[91mIngrese el nombre del archivo para guardar el gráfico de consultas (incluya la extensión, ej. consultas.png): \033[0m")
    plt.tight_layout()
    plt.savefig(filename1)
    print(f"Gráfico de consultas guardado como {filename1}")
    plt.close()

    # Histograma del tiempo de respuesta
    plt.figure(figsize=(19.2, 10.8))
    plt.hist(tiempos_respuesta, bins=20, color='b', edgecolor='black')
    plt.title('Histograma del Tiempo de Respuesta')
    plt.xlabel('Tiempo de Respuesta (segundos)')
    plt.ylabel('Frecuencia')
    filename2 = input("\033[91mIngrese el nombre del archivo para guardar el histograma de tiempo de respuesta (incluya la extensión, ej. tiempos.png): \033[0m")
    plt.tight_layout()
    plt.savefig(filename2)
    print(f"Histograma de tiempo de respuesta guardado como {filename2}")
    plt.close()

if __name__ == "__main__":
    main()
