import Link from "next/link";


export default function Page() {
    return (
        <div>
            <a href="/example/test" className="Text-blue-500 underline">
            Go Example Test Page
            </a>
            <Link href="/example/test" className="text-blue-500 underline ml-2">
            Go Example Test Page
            </Link>
        </div>
    );
}


//create a path 
//person
//person/blogs
//person->blogs->[slugs] ->edit