export const uid = () => Math.random().toString(36).slice(2, 8);

export const getImageUrl = (image, folder) =>{
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${folder}/${image}`;
}